import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { IonicPage, Platform, ViewController, AlertController, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Device } from '@ionic-native/device';
import { ActionSheet, ActionSheetOptions } from '@ionic-native/action-sheet';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import { LoginService } from '../../providers/logins/login.service';
import { BpProvider } from '../../providers/buddypress/bp-provider';

@IonicPage()
@Component({
  selector: 'page-edit-profile-modal',
  templateUrl: 'edit-profile-modal.html',
})
export class EditProfileModal {

  public form: FormGroup;
  public profileAvatar: string;
  public isReadyToSave: boolean;
  public customClasses: string;
  private login_data: any;
  private formValuechanges: Subscription;
  private readonly FIELDS = {
    FIRSTNAME: 1
  };

  constructor(
    public platform: Platform,
    public viewCtrl: ViewController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public formBuilder: FormBuilder,
    public device: Device,
    public actionSheet: ActionSheet,
    public camera: Camera,
    public storage: Storage,
    public translate: TranslateService,
    public loginservice: LoginService,
    public bpProvider: BpProvider) {

    this.profileAvatar = String(this.loginservice.user.avatar);
    this._createForm();
    this._doIphoneX();
  }

  /**
   * Tasks you want to do every time you enter in the view (setting event listeners, updating a table, etc.)
   */
  public ionViewWillEnter() {
    this._getLoginData();
  }

  /**
   * Get the login data from the storage
   * @TODO consider putting this on a provider to be used as a service
   */
  private _getLoginData() {
    this.storage.get('user_login')
      .then(login_data => {
        if (login_data) {
          this.login_data = login_data;
          this._getFieldsFromAPI();
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  /**
   * Gets profile fields from API
   */
  private _getFieldsFromAPI(): void {
    const loading = this.loadingCtrl.create({
      showBackdrop: false,
      dismissOnPageChange: false
    });
    loading.present();;

    let getFieldsPromises: Promise<any>[] = [];

    // Add firstname to promise of all
    getFieldsPromises.push(this._getField(this.FIELDS.FIRSTNAME, this.form.controls.firstname))

    // Add as many fields as you want following the above example

    // Wait until all promises have finished
    Promise.all(getFieldsPromises)
      .then(() => {
        loading.dismiss();
      })
      .catch(error => {
        loading.dismiss();
      });
  }

  /**
   * Gets the field value from the api and shows it to the form field
   * @param {number} fieldId
   * @param {AbstractControl} formControl
   * @returns {Promise<any>}
   */
  private _getField(fieldId: number, formControl: AbstractControl): Promise<any> {
    return this.bpProvider.getField(this.login_data, fieldId)
      .then(field => {
        formControl.patchValue(field.data.value);
      })
      .catch(error => {
        console.log(error);
      });
  }

  /**
   * Creates a form using formBuilder
   */
  private _createForm() {
    this.form = this.formBuilder.group({
      firstname: [this.loginservice.user.firstname, Validators.required],
      email: [this.loginservice.user.email, Validators.compose([Validators.required, Validators.email])],
      avatar: null
    }); // @TODO consider showing validation error messages

    // Watch the form for changes
    this.formValuechanges = this.form.valueChanges.subscribe(() => {
      this.isReadyToSave = this.form.valid;
    });
  }

  /**
   * Changes custom class as a workaround for iphonex status bar
   */
  private _doIphoneX(): void {
    if (this.device && this.device.model) {
      let model = this.device.model.toLowerCase();
      if (model.indexOf('iphone10') >= 0) {
        if (this.platform.isLandscape()) {
          this.customClasses = 'iphoneX-landscape'
        } else {
          this.customClasses = 'iphoneX-portrait'
        }
      }
    }
  }

  /**
   * Dismissed the modal
   */
  public dismiss(): void {
    this.viewCtrl.dismiss();
  }

  /**
   * Edits the profile's avatar from camera or library
   */
  public editAvatar(): void {
    const actionSheetOptions: ActionSheetOptions = {
      title: this.translate.instant('Choose an image'),
      buttonLabels: [
        this.translate.instant('Take Photo'),
        this.translate.instant('Photo Library')
      ],
      addCancelButtonWithLabel: this.translate.instant('Cancel'),
      androidTheme: 5,
      androidEnableCancelButton: true,
      destructiveButtonLast: true
    };

    this.actionSheet.show(actionSheetOptions)
      .then((buttonIndex: number) => {
        if (buttonIndex === 1) {
          this._takePhoto();
        } else if (buttonIndex === 2) {
          this._chooseFromLibrary();
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  /**
   * Takse photo from camera
   */
  private _takePhoto() {
    const cameraOptions: CameraOptions = {
      sourceType: this.camera.PictureSourceType.CAMERA,
      mediaType: this.camera.MediaType.PICTURE,
      encodingType: this.camera.EncodingType.JPEG,
      destinationType: this.camera.DestinationType.DATA_URL,
      quality: 50,
      targetWidth: 1204,
      targetHeight: 1204
    }

    this.camera.getPicture(cameraOptions)
      .then((imageData) => {
        this.form.controls.avatar.patchValue(imageData);
        // imageData is either a base64 encoded string or a file URI
        // If it's base64:
        this.profileAvatar = 'data:image/jpeg;base64,' + imageData;
      })
      .catch(error => {
        console.error(error);
      });
  }

  /**
   * Chooses a photo from library
   */
  private _chooseFromLibrary() {
    const cameraOptions: CameraOptions = {
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      mediaType: this.camera.MediaType.PICTURE,
      encodingType: this.camera.EncodingType.JPEG,
      destinationType: this.camera.DestinationType.DATA_URL,
      quality: 50,
      targetWidth: 1204,
      targetHeight: 1204
    }

    this.camera.getPicture(cameraOptions)
      .then((imageData) => {
        this.profileAvatar = 'data:image/jpeg;base64,' + imageData;
        // imageData is either a base64 encoded string or a file URI
        // If it's base64:
        this.form.controls.avatar.patchValue(imageData);
      })
      .catch(error => {
        console.error(error);
      });
  }

  /**
   * Submits the data 
   */
  public editProfile(): void {
    const loading = this.loadingCtrl.create({
      showBackdrop: false,
      dismissOnPageChange: false
    });
    loading.present();;

    // console.log(this.form.value);

    interface Field { fieldId: number, fieldValue: string };
    let fields: Field[] = [];

    if (this.form.value.firstname) {
      fields.push({ fieldId: this.FIELDS.FIRSTNAME, fieldValue: this.form.value.firstname });
    }

    // Add as many fields as you want following the above example

    let prepareDataFieldPromises: Promise<any>[] = [];
    fields.forEach(field => {
      prepareDataFieldPromises.push(this.bpProvider.updateProfileField(this.login_data, field.fieldId, field.fieldValue));
    });

    // Update avatar only if a new avatar picture is selected for upload
    if (this.form.value.avatar) {
      prepareDataFieldPromises.push(this.bpProvider.updateProfileAvatar(this.login_data, this.form.value.avatar));
    }

    // Wait until all promises have finished
    Promise.all(prepareDataFieldPromises)
      .then(() => {
        loading.dismiss();
        this.viewCtrl.dismiss();
      })
      .catch(error => {
        console.log(error);
        loading.dismiss();
        const alert = this.alertCtrl.create({
          title: this.translate.instant('Error'),
          subTitle: this.translate.instant('Could not update your profile. Please try again.'),
          buttons: ['OK']
        });
        alert.present();
      });
  }

  /**
   * Destroys subcriptions when you are leaving the page
   */
  public ionViewWillLeave(): void {
    this.formValuechanges.unsubscribe();
  }
}
