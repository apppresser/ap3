import { Component } from '@angular/core';
import { Events, ViewController, LoadingController, IonicPage, ToastController, NavParams, ModalController } from 'ionic-angular';
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
	uploadedImage: string;
	route: any;

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
		private actionSheet: ActionSheet,
		public modalCtrl: ModalController
		) {
      
		if(this.navParams.get('title')) {
			this.title = this.navParams.get('title');
		} else {
			this.title = 'Activity';
		}

		this.route = this.navParams.get('route');

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
		this.bpProvider.postActivity( this.login_data, this.activity, this.uploadedImage ).then( ret => {
			console.log(ret)
			this.presentToast('Update posted!')
			this.events.publish('bp-list-reload')
			setTimeout( ()=> {
				this.dismiss()
			}, 500 )
		})

	}

	openLoginModal() {
		this.modalCtrl.create('LoginModal')
	}

	imageSheet() {

		let options = {
	      title: 'Choose an image',
	      buttonLabels: ['Take Photo', 'Photo Library'],
	      addCancelButtonWithLabel: 'Cancel',
	      destructiveButtonLast: true
	    }
    
	    this.actionSheet.show( options ).then( (buttonIndex: number) => {

	      if( buttonIndex === 1 ) {

	        this.bpProvider.doCamera( 'camera' ).then( image => {

	        	this.uploadedImage = (<string>image)
	        })

	      } else if( buttonIndex === 2 ) {

	        this.bpProvider.doCamera( 'library' ).then( image => {
	        	console.log(image) 
	        	this.uploadedImage = (<string>image)
	        })

	      }

	    })

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