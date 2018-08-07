import { Component } from '@angular/core';
import { Events, ViewController, LoadingController, IonicPage, ToastController, NavParams } from 'ionic-angular';
import {Storage} from '@ionic/storage';
import {Device} from '@ionic-native/device';
import {TranslateService} from '@ngx-translate/core';
import {BpProvider} from '../../providers/buddypress/bp-provider';
import { ActionSheet, ActionSheetOptions } from '@ionic-native/action-sheet';

@IonicPage()
@Component({
  selector: 'bp-modal',
  templateUrl: 'bp-modal.html'
})
export class BpModal {

	spinner: any
	is_preview: boolean = false;
	title: string = '';
	login_data: any;
	activity: any = {};
	uploadedImage: any;

	constructor(
		public navParams: NavParams,
		public viewCtrl: ViewController,
		public loadingCtrl: LoadingController,
		public events: Events,
		public storage: Storage,
		public translate: TranslateService,
		private toastCtrl: ToastController,
		private Device: Device,
		public bpProvider: BpProvider,
		private actionSheet: ActionSheet
		) {
      
		if(this.navParams.get('title')) {
			this.title = this.navParams.get('title');
		} else {
			this.title = 'Activity';
		}

		// get login data on first load
		this.storage.get('user_login').then( data => {

			if(data) {
			  this.login_data = data
			}

		});

		this.is_preview = (location.href.indexOf('myapppresser') > 0);

	}

	submitForm() {
		console.log(this.activity)
		this.dismiss()
	}

	openLoginModal() {

	}

	imageSheet() {

		this.uploadedImage = 'http://appdev.local/wp-content/uploads/2018/05/af2e834c1e23ab30f1d672579d61c25a_15.png'

		return;

		let options = {
	      title: 'Choose an image',
	      buttonLabels: ['Take Photo', 'Photo Library'],
	      addCancelButtonWithLabel: 'Cancel',
	      destructiveButtonLast: true
	    }
    
	    this.actionSheet.show( options ).then( (buttonIndex: number) => {

	      if( buttonIndex === 1 ) {

	        this.bpProvider.doCamera( 'camera' ).then( this.gotImage )

	      } else if( buttonIndex === 2 ) {

	        this.bpProvider.doCamera( 'library' ).then( this.gotImage )

	      }

	    })

	}

	gotImage( image ) {
		console.log(image)
		this.uploadedImage = image
	}

	dismiss() {
		this.viewCtrl.dismiss();
	}

	showSpinner() {
		this.spinner = this.loadingCtrl.create();

		this.spinner.present();
	}

	hideSpinner() {
		this.spinner.dismiss();
	}

	presentToast(msg) {

	    let toast = this.toastCtrl.create({
	      message: msg,
	      duration: 5000,
	      position: 'bottom'
	    });

	    toast.present();

	}

}