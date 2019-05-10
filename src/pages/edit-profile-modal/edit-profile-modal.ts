import { Component } from '@angular/core';
import { IonicPage, Platform, ViewController, AlertController, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Device } from '@ionic-native/device';
import { ActionSheet, ActionSheetOptions } from '@ionic-native/action-sheet';
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
          // @TODO consider grouping fields as in buddypress (Base, Single Fields, Multi Fields)
          this.profileFields.push({
            id: field.id,
            name: field.name,
            value: field.data.value,
            type: field.type,
            loading: false,
            order: field.field_order
          });
        });

        // Sort profileFields by field_order
        this.profileFields.sort(function (field1: Field, field2: Field) {
          return field1.order - field2.order; // Ascending
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
          this.bpProvider.doCamera('camera')
            .then(image => {
              let uploadedImage = (<string>image);
              this._updateAvatarToApi(uploadedImage);
            })
            .catch(error => {
              console.error(error);
            });
        } else if (buttonIndex === 2) {
          this.bpProvider.doCamera('library')
            .then(image => {
              let uploadedImage = (<string>image);
              this._updateAvatarToApi(uploadedImage);
            })
            .catch(error => {
              console.error(error);
            });
        }
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

      case 'datebox': {
        // https://ionicframework.com/docs/v3/native/date-picker/
        // or
        // https://ionicframework.com/docs/v3/components/#datetime
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
    let fieldIndex: number = this.profileFields.findIndex(currentField => currentField.id === field.id);
    this.profileFields[fieldIndex].loading = true;
    this.bpProvider.updateProfileField(this.login_data, this.profileFields[fieldIndex].id, updatedFieldValue)
      .then(() => {
        this.profileFields[fieldIndex].value = updatedFieldValue;
        this.profileFields[fieldIndex].loading = false;
      })
      .catch(error => {
        console.log(error);
        this._handleErrorFromApi();
        this.profileFields[fieldIndex].loading = false;
      });
  }

  /**
   * Updates the new pofile's avatar to the API
   * @param {string} profileAvatar
   */
  private _updateAvatarToApi(profileAvatar: string): void {
    const loading = this.loadingCtrl.create({
      showBackdrop: false,
      dismissOnPageChange: false
    });
    loading.present();
    
    this.bpProvider.updateProfileAvatar(this.login_data, profileAvatar)
      .then(avatar => {
        this.profileAvatar = avatar[0].full;
        this.loginservice.user.avatar = avatar[0].full;
        this.login_data.avatar = avatar[0].full;
        this.storage.set('user_login', this.login_data);
        loading.dismiss();
      })
      .catch(error => {
        console.error(error);
        loading.dismiss();
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
