import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Events, ToastController, LoadingController, Platform } from 'ionic-angular';
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
	cart_count: number;
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
		public loadingCtrl: LoadingController,
		public platform: Platform
		) {


	}

	ionViewDidEnter() {

		this.getCartContents()
		
	}

	getCartContents() {

		this.wooProvider.getCartContents().then( response => {

			if( typeof (<any>response) === 'string' ) {
				this.cartEmpty = (<any>response)
				this.cart_total = null
				this.products = []
			} else {
				this.products = (<any>response).products 
				this.cart_total = (<any>response).cart_total.cart_contents_total
				this.cart_count = (<any>response).cart_total.cart_contents_count
			}

			// any time a cart item is changed we get here, so publish cart count event here
			this.events.publish( 'cart_change', this.cart_count )
			
			console.log(response ) 
		})

	}

	clearCart() {

		this.showSpinner()

		this.wooProvider.clearCart().then( response => {

			this.hideSpinner()
			this.products = []
			this.cart_total = 0
			this.presentToast(response)
			this.storage.set( 'cart_count', 0 )
			this.events.publish( 'cart_change', 0 )
			this.cartEmpty = "Cart is empty."

		}).catch( e => console.warn(e) )

	}

	removeItem( item ) {

		// small delay otherwise it feels too jumpy
		setTimeout( ()=> {

			// we remove the item right away, before the API call. It gets added back if there is an error.
			for (let i = this.products.length - 1; i >= 0; i--) {
				if( this.products[i].product_id === item.product_id ) {
				  this.products.splice(i, 1);
				  break;
				}
			}

			this.cart_total = "Calculating..."

			this.presentToast("Item removed.")

		}, 200 )

		this.wooProvider.removeItem( item ).then( response => {

			// success
			console.log(response )

		} ).catch( e => {
			this.presentToast("Could not remove item.")
			console.warn( e ) 
		}).then( () => {
			// update totals
			this.getCartContents()
		})

	}

	increment( item ) {
		item.quantity = parseInt( item.quantity ) + 1
		this.quantityChanged( item )
	}

	decrement( item ) {
		item.quantity = parseInt( item.quantity ) - 1
		if( item.quantity === 0 ) {
			this.removeItem(item)
		} else {
			this.quantityChanged( item )
		}
	}

	quantityChanged(item) {
		console.log(item )
		this.wooProvider.updateItem( item, item.quantity ).then( response => {

			this.presentToast(response )
			// update totals
			this.getCartContents()

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

	loadDetail(item) {

		let opt = {};

		if( this.platform.isRTL && this.platform.is('ios') )
		  opt = { direction: 'back' }
			
		this.navCtrl.push('WooDetail', {
		  item: item
		}, opt);

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