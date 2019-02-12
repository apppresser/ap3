import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IonicPage, Platform, ViewController } from 'ionic-angular';
import { Device } from '@ionic-native/device';
import { ActionSheet, ActionSheetOptions } from '@ionic-native/action-sheet';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Subscription } from 'rxjs/Subscription';
import { LoginService } from '../../providers/logins/login.service';
import { TranslateService } from '@ngx-translate/core';

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
  private formValuechanges: Subscription;

  constructor(
    public platform: Platform,
    public viewCtrl: ViewController,
    public formBuilder: FormBuilder,
    public device: Device,
    public actionSheet: ActionSheet,
    public camera: Camera,
    public translate: TranslateService,
    public loginservice: LoginService) {

    this.profileAvatar = String(this.loginservice.user.avatar);
    this._createForm();
    this._doIphoneX();
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

    // Watch the form for changes, and
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

    this.actionSheet.show(actionSheetOptions).then((buttonIndex: number) => {
      if (buttonIndex === 1) {
        this._takePhoto();
      } else if (buttonIndex === 2) {
        this._chooseFromLibrary();
      }
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
  public submitForm(): void {
    console.log(this.form.value);
    // Dismiss modal after handling the fields
    this.viewCtrl.dismiss();
  }

  /**
   * Destroys subcriptions when you are leaving the page
   */
  public ionViewWillLeave(): void {
    this.formValuechanges.unsubscribe();
  }
}
