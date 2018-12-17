import { Component, OnInit, Input, ContentChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Events, ToastController, LoadingController, Platform, Content } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import {InAppBrowser, InAppBrowserObject} from '@ionic-native/in-app-browser';

@Component({
  selector: 'ap-form',
  templateUrl: 'ap-form.html',
})
export class ApForm {

	@Input() url: string;
	@Input() amount: boolean = false
	@Input() email: boolean = true
	@Input() firstName: boolean = false
	@Input() lastName: boolean = false
	@Input() message: boolean = false
	@Input() currencySymbol: string = "$"

	items: any;
	loading: any;
	browser: any;

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public storage: Storage,
		public viewCtrl: ViewController,
		public events: Events,
		public toastCtrl: ToastController,
		public loadingCtrl: LoadingController,
		public platform: Platform,
		public iab: InAppBrowser
		) {
	}

	ngAfterViewInit() {
		if( !this.url || this.url === '' ) {
			this.presentToast("No form URL set.")
		}
	}

	submitForm( form ) {

		let params = this.objToParams( form.value )

		var concat;

		// check if url already has a query param
		if( this.url.indexOf('?') > 0 ) {
			concat = '&';
		} else {
			concat = '?';
		}

		this.createBrowser( this.url + concat + params)
	}

	createBrowser( url ) {

		if( !this.platform.is('ios') && !this.platform.is('android') ) {
			alert('Redirecting, please try from a device for a better experience.')
			window.open( url, '_blank' )
			return;
		}

		this.browser = this.iab.create( url, '_blank' )

	}

	objToParams(obj) {
	  var str = [];
	  for (var p in obj)
	    if (obj.hasOwnProperty(p)) {
	      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
	    }
	  return str.join("&");
	}

	presentToast(msg) {

		let toast = this.toastCtrl.create({
		  message: msg,
		  duration: 3000,
		  position: 'bottom',
		  cssClass: 'normal-toast'
		});

		toast.present();

	}

	showSpinner() {

        // create only one spinner
        if(!this.loading) {
            this.loading = this.loadingCtrl.create({
                showBackdrop: false,
                dismissOnPageChange: false
            });

            this.loading.present();
        }
    }

    hideSpinner() {

    	if( this.loading )
    		this.loading.dismiss();
    }

}