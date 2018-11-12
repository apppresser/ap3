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

		events.subscribe('cart_change', count => {
	      this.cart_count = (<number>count)
	    })

	}

	ionViewDidEnter() {

		this.getCartContents()
		
	}

	getCartContents() {

		this.showSpinner()

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
		}).catch( e => {
			console.warn(e)
		}).then( () => {
			this.hideSpinner()
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

	openCheckout() {

		let item = window.localStorage.getItem( 'myappp' );
    	let url = JSON.parse( item ).wordpress_url;

    	this.createBrowser( url + 'checkout' )

	}

	loadDetail(item) {

		let opt = {};

		if( this.platform.isRTL && this.platform.is('ios') )
		  opt = { direction: 'back' }
			
		this.navCtrl.push('WooDetail', {
		  item: item
		}, opt);

	}

	createBrowser( url ) {

		if( !this.platform.is('ios') && !this.platform.is('android') ) {
			alert('Redirecting, please try from a device for a better checkout experience.')
			window.open( url, '_blank' )
			return;
		}

		this.browser = this.iab.create( url, '_blank', 'location=no,toolbarcolor=#ffffff,navigationbuttoncolor=#444444,closebuttoncolor=#444444' )

		this.browserSubscription1 = this.browser.on('exit').subscribe( data => {
          console.log('browser closed', data)
          
          // update cart in case items were changed on site
          this.getCartContents()

          this.browserCleanup( data )
          // this.orderComplete()
        })

        this.browserSubscription2 = this.browser.on('loadstop').subscribe( event => {
        	console.log('loadstop', event)
          	this.maybeCompleteCheckout( event );
        })

	}

	// get order ID from url (woocommerce)
    getOrderId( url ) {

        let order_id = '';

        if( url.indexOf('order_id') >= 0 ) {
            // get order ID param

            if( url.indexOf('cmd=_cart') >= 0 ) {
                url = decodeURIComponent( url )
            }
            
            let url2 = new URL( url );
            order_id = ( url2.searchParams.get("order_id") ? url2.searchParams.get("order_id") : null );
        } else if( url.indexOf('order-received') >= 0 ) {
            // get order ID from url
            // this regex might fail if there are numbers in the url
            order_id = /(\/[0-9]+\/)/g.exec( url )[0]
            order_id = order_id.replace(/\//g, "")
        }

        return order_id;
        
    }

	maybeCompleteCheckout( event ) {

		if( event.url.indexOf('order-received') >= 0 ) {
			this.order_id = this.getOrderId( event.url )
			this.browser.close();
			this.browserCleanup( null );
			// send to order complete page
        	this.orderComplete()
		}

	}

	orderComplete() {

        console.log('order complete')

        // TODO: if order is unsuccessful don't clear cart...
        this.clearCart()

        this.browserSubscription1.unsubscribe()
        this.browserSubscription2.unsubscribe()
        // get empty cart page out of history
        this.navCtrl.pop()

        // send to order complete page
        this.navCtrl.push('ThanksPage', { 'order_id': this.order_id } )

    }

	browserCleanup( data ) {
    	console.log('browser closed', data)
    	// TODO: figure out what to do here. Example: if order is incomplete, show message
    	this.presentToast('Show appropriate message here')
    	this.browserSubscription1.unsubscribe()
        this.browserSubscription2.unsubscribe()
        this.browser = null
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