import { Component } from '@angular/core';
import { IonicPage, Platform, ViewController, AlertController, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Device } from '@ionic-native/device';
import { ActionSheet, ActionSheetOptions } from '@ionic-native/action-sheet';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { TranslateService } from '@ngx-translate/core';
import { LoginService } from '../../providers/logins/login.service';
import { BpProvider } from '../../providers/buddypress/bp-provider';

export interface Field {
  id: number,
  name: string,
  value: string,
  type: string,
  loading: boolean,
  order: number
};

@IonicPage()
@Component({
  selector: 'page-edit-profile-modal',
  templateUrl: 'edit-profile-modal.html',
})
export class EditProfileModal {

  public profileFields: Array<Field>;
  public profileAvatar: string;
  public customClasses: string;
  private login_data: any;

  constructor(
    public platform: Platform,
    public viewCtrl: ViewController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public device: Device,
    public actionSheet: ActionSheet,
    public camera: Camera,
    public storage: Storage,
    public translate: TranslateService,
    public loginservice: LoginService,
    public bpProvider: BpProvider) {

    this.profileFields = [];
    this.profileAvatar = String(this.loginservice.user.avatar);
    this._doIphoneX();
  }

  /**
   * Tasks you want to do every time you enter in the view (setting event listeners, updating a table, etc.)
   */
  public ionViewWillEnter(): void {
    this._getLoginData();
  }

  /**
   * Get the login data from the storage
   * @TODO consider putting this on a provider to be used as a service
   */
  private _getLoginData(): void {
    this.storage.get('user_login')
      .then(login_data => {
        if (login_data) {
          this.login_data = login_data;
          this._getAllFields();
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  /**
   * Gets profile fields from API
   */
  private _getAllFields(): void {
    const loading = this.loadingCtrl.create({
      showBackdrop: false,
      dismissOnPageChange: false
    });
    loading.present();

    this.bpProvider.getFields(this.login_data)
      .then(response => {
        let fields: Array<any> = response.json();
        fields.forEach(field => {
          this.profileFields[field.field_order] = {
            id: field.id,
            name: field.name,
            value: field.data.value,
            type: field.type,
            loading: false,
            order: field.field_order
          };
        });
        loading.dismiss();
      })
      .catch(error => {
        console.log(error);
        loading.dismiss();
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
  private _takePhoto(): void {
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
        let profileAvatar = 'data:image/jpeg;base64,' + imageData;
        this._updateAvatarToApi(profileAvatar);
      })
      .catch(error => {
        console.error(error);
      });
  }

  /**
   * Chooses a photo from library
   */
  private _chooseFromLibrary(): void {
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
        let profileAvatar = 'data:image/jpeg;base64,' + imageData;
        this._updateAvatarToApi(profileAvatar);
      })
      .catch(error => {
        console.error(error);
      });
  }


  /**
   * Opens the right alert controller to
   * @param {Field} field
   */
  public editFieldValue(field: Field): void {
    let fieldType = field.type;
    switch (fieldType) {
      case 'textbox': {
        this._editTextField(field, 'text');
        break;
      }

      case 'telephone': {
        this._editTextField(field, 'tel');
        break;
      }

      case 'number': {
        this._editTextField(field, 'number');
        break;
      }

      case 'url': {
        this._editTextField(field, 'url');
        break;
      }

      /*
      case 'radio': {
        // https://ionicframework.com/docs/v3/components/#alert-radio
        break;
      }

      case 'checkbox': {
        // https://ionicframework.com/docs/v3/components/#alert-checkbox
        break;
      }
      */

      default: {
        this._editFieldNotAvailable();
        break;
      }
    }
  }

  /**
   * Shows an alert to edit text fields
   * @param {Field} field
   * @param {string} fieldType
   */
  private _editTextField(field: Field, fieldType: string): void {
    const prompt = this.alertCtrl.create({
      title: this.translate.instant('Edit field'),
      subTitle: field.name,
      inputs: [
        {
          name: 'current_field_name',
          placeholder: field.name,
          type: fieldType,
          value: field.value
        },
      ],
      buttons: [
        {
          text: this.translate.instant('Cancel'),
        },
        {
          text: this.translate.instant('Save'),
          handler: data => {
            this._updateFieldToApi(field, data.current_field_name);
          }
        }
      ]
    });
    prompt.present();
  }


  /**
   * Shows an alert that field edit is not available
   */
  private _editFieldNotAvailable(): void {
    const alert = this.alertCtrl.create({
      title: this.translate.instant('Edit field'),
      subTitle: this.translate.instant('Editing this field is not available yet.'),
      buttons: ['OK']
    });
    alert.present();
  }

  /**
   * Updates the current field with the new value to the API
   * @param {Field} field
   * @param {string} updatedFieldValue
   */
  private _updateFieldToApi(field: Field, updatedFieldValue: string): void {
    this.profileFields[field.order].loading = true;
    this.bpProvider.updateProfileField(this.login_data, this.profileFields[field.order].id, updatedFieldValue)
      .then(() => {
        this.profileFields[field.order].value = updatedFieldValue;
        this.profileFields[field.order].loading = false;
      })
      .catch(error => {
        console.log(error);
        this._handleErrorFromApi();
        this.profileFields[field.order].loading = false;
      });
  }

  /**
   * Updates the new pofile's avatar to the API
   * @param {string} profileAvatar
   */
  private _updateAvatarToApi(profileAvatar: string): void {
    this.bpProvider.updateProfileAvatar(this.login_data, profileAvatar)
      .then(() => {
        this.profileAvatar = profileAvatar;
      })
      .catch(error => {
        console.log(error);
        this._handleErrorFromApi();
      });
  }

  /**
   * Shows an alert if the update to the API fails
   */
  private _handleErrorFromApi(): void {
    const alert = this.alertCtrl.create({
      title: this.translate.instant('Error'),
      subTitle: this.translate.instant('Could not update your profile. Please try again.'),
      buttons: ['OK']
    });
    alert.present();
  }
}
