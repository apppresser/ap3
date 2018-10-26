import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Events, ToastController, LoadingController } from 'ionic-angular';
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
	cart_total: any;
	cartEmpty: string;
	quantity: any;
	loading: any;

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public storage: Storage,
		public viewCtrl: ViewController,
		public events: Events,
		public wooProvider: WooProvider,
		public toastCtrl: ToastController,
		public loadingCtrl: LoadingController
		) {


	}

	ionViewDidLoad() {

		this.getCartContents()
		
	}

	getCartContents() {

		this.wooProvider.getCartContents().then( response => {

			if( typeof (<any>response) === 'string' ) {
				this.cartEmpty = (<any>response)
				this.cart_total = null
			} else {
				this.products = (<any>response).products 
				this.cart_total = (<any>response).cart_total.cart_contents_total
			}
			
			console.log(response ) 
		})

	}

	// getCartStorage() {

	// 	this.storage.get( 'cart' ).then( data => {

	// 		if( !data )
	// 			return;

	// 		this.products = data

	// 		for (var i = 0; i < data.length; ++i) {
	// 			let total = parseInt( data[i].price ) * parseInt( data[i].quantity )
	// 			this.cart_total = ( this.cart_total ? this.cart_total : 0 ) + total
	// 		}

	// 	})

	// }

	clearCart() {

		this.showSpinner()

		this.wooProvider.clearCart().then( response => {

			this.hideSpinner()
			this.products = []
			this.cart_total = 0
			this.presentToast(response)
			this.storage.set( 'cart_count', 0 )
			this.events.publish( 'clear_cart', 0 )

		}).catch( e => console.warn(e) )

	}

	removeItem( item ) {

		// we remove the item right away, before the API call. It gets added back if there is an error.
		for (let i = this.products.length - 1; i >= 0; i--) {
			if( this.products[i].product_id === item.product_id ) {
			  this.products.splice(i, 1);
			  break;
			}
		}

		this.cart_total = "Calculating..."

		this.presentToast("Item removed.")

		this.wooProvider.removeItem( item ).then( response => {

			// success
			console.log(response )
			this.events.publish( 'cart_change' )

		} ).catch( e => {
			this.presentToast("Could not remove item.")
			console.warn( e ) 
		}).then( () => {
			// update totals
			this.getCartContents()
		})

	}

	quantityChanged(e, item) {
		console.log(e.value, item )
		this.wooProvider.updateItem( item, e.value ).then( response => {

			this.presentToast(response )
			this.events.publish( 'cart_change' )

		} ).catch( e => {
			this.presentToast("Could not update item.")
			console.warn( e ) 
		})
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