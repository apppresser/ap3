import { Component } from '@angular/core';
import { Events, ViewController, LoadingController, IonicPage, ToastController, NavParams } from 'ionic-angular';
import {Storage} from '@ionic/storage';
import {Device} from '@ionic-native/device';
import {TranslateService} from '@ngx-translate/core';

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

	constructor(
		public navParams: NavParams,
		public viewCtrl: ViewController,
		public loadingCtrl: LoadingController,
		public events: Events,
		public storage: Storage,
		public translate: TranslateService,
		private toastCtrl: ToastController,
		private Device: Device
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
		console.log(this.activity.content)
		this.dismiss()
	}

	openLoginModal() {

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