import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Events, ToastController, LoadingController, Platform } from 'ionic-angular';
import {Iframe} from '../iframe/iframe';
import { Storage } from '@ionic/storage';
import { WooProvider } from '../../providers/woo/woo';
import {InAppBrowser, InAppBrowserObject} from '@ionic-native/in-app-browser';

@IonicPage()
@Component({
  selector: 'page-cart',
  templateUrl: 'cart.html',
})
export class CartPage {

	products: any;
	cart_total: any;
	cartEmpty: string;
	cart_count: number;
	quantity: any;
	loading: any;
	browser: any;
	browserSubscription1: any;
    browserSubscription2: any;
    order_id: any;

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public storage: Storage,
		public viewCtrl: ViewController,
		public events: Events,
		public wooProvider: WooProvider,
		public toastCtrl: ToastController,
		public loadingCtrl: LoadingController,
		public platform: Platform,
		public iab: InAppBrowser
		) {

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