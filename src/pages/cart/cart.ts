import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController,  ToastController, LoadingController, Platform } from 'ionic-angular';

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
		public viewCtrl: ViewController,
		public toastCtrl: ToastController,
		public loadingCtrl: LoadingController,
		public platform: Platform
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

}