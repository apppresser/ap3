import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Events } from 'ionic-angular';
import {Iframe} from '../iframe/iframe';
import { Storage } from '@ionic/storage';
import { WooProvider } from '../../providers/woo/woo';

@IonicPage()
@Component({
  selector: 'page-cart',
  templateUrl: 'cart.html',
})
export class CartPage {

	items: any;
	cart_total: number;

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public storage: Storage,
		public viewCtrl: ViewController,
		public events: Events,
		public wooProvider: WooProvider
		) {


	}

	ionViewDidLoad() {

		this.getCartItems()
		
	}

	getCartItems() {

		this.storage.get( 'cart' ).then( data => {

			if( !data )
				return;

			this.items = data

			for (var i = 0; i < data.length; ++i) {
				let total = parseInt( data[i].price ) * parseInt( data[i].quantity )
				this.cart_total = ( this.cart_total ? this.cart_total : 0 ) + total
			}

		})

	}

	clearCart() {

		this.storage.remove( 'cart' )

		this.items = []

		this.cart_total = 0

		this.wooProvider.clearCart().then( response => console.log(response ) )

		this.events.publish( 'clear_cart', 0 )

	}

	goCheckout() {

		let item = window.localStorage.getItem( 'myappp' );
    	let url = JSON.parse( item ).wordpress_url;

    	this.navCtrl.push(Iframe, { url: url + 'checkout', title: 'Checkout' } );

		//this.navCtrl.push('CheckoutPage');

	}

	dismiss() {
		this.viewCtrl.dismiss();
	}

}