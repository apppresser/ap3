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

	products: any;
	cart_total: number;
	cartEmpty: string;

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

		// this.getCartStorage()

		this.getCartContents()
		
	}

	getCartContents() {

		this.wooProvider.getCartContents().then( response => {

			if( typeof (<any>response) === 'string' ) {
				this.cartEmpty = (<any>response)
			} else {
				this.products = (<any>response).products 
				this.cart_total = (<any>response).cart_total.cart_contents_total
			}
			
			console.log(response ) 
		})

	}

	getCartStorage() {

		this.storage.get( 'cart' ).then( data => {

			if( !data )
				return;

			this.products = data

			for (var i = 0; i < data.length; ++i) {
				let total = parseInt( data[i].price ) * parseInt( data[i].quantity )
				this.cart_total = ( this.cart_total ? this.cart_total : 0 ) + total
			}

		})

	}

	clearCart() {

		this.storage.remove( 'cart' )

		this.products = []

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