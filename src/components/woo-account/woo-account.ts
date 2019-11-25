import { Component, OnInit, HostBinding } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController, ModalController, Events } from 'ionic-angular';
import { WooProvider } from '../../providers/woo/woo';
import {Storage} from '@ionic/storage';
import {InAppBrowser, InAppBrowserObject} from '@ionic-native/in-app-browser';

@Component({
  selector: 'woo-account',
  templateUrl: 'woo-account.html',
})
export class WooAccountComponent implements OnInit {

	// add has-toolbar class for iPhone X fix
	@HostBinding('class.has-toolbar') classes = true

	order_id: any;
	orders: any;
	account: any;
	orderConfirmation: any;
	title: string;
	login_data: any;
	customer: any;
	loading: any;
	showOrdersBool: boolean = false;
	showAccountBool: boolean = false;
	loginModal: any;
	accountUrl: any;

	constructor(
		public navCtrl: NavController, 
		public navParams: NavParams,
		public wooProvider: WooProvider,
		public storage: Storage,
		public loadingCtrl: LoadingController,
		public iab: InAppBrowser,
		public toastCtrl: ToastController,
		public modalCtrl: ModalController,
		public events: Events
		) {
	}

	ngOnInit() {

		this.order_id = this.navParams.get('order_id');

		this.title = ( this.navParams.get('title') ? this.navParams.get('title') : "Your Order" )

		this.storage.get('user_login').then( login_data => {

			this.login_data = login_data

			if( this.order_id ) {
				this.getOrder( this.order_id )
			} else {
				this.getCustomerOrders()
			}

		})

		this.listeners()
		
	}

	listeners() {

		// set login data after modal login
	    this.events.subscribe('user:login', data => {
	      this.login_data = data
	      this.getCustomerOrders()
	    });

	    this.events.subscribe('user:logout', data => {
	      this.login_data = null;
	    });

	}

	getCustomerOrders() {

		if( this.login_data && this.login_data.user_id ) {
			this.customer = this.login_data.user_id
			this.getOrders( '?customer=' + this.login_data.user_id + '&status=pending,processing,on-hold,completed,refunded,failed' )
		} else {
			this.presentToast('Please login.')
			this.showLoginModal()
		}
	}

	getOrder( id ) {

		this.showSpinner()

		this.wooProvider.get( 'orders/' + id, 'nopaging' ).then( response => {
			console.log(response)
			this.orderConfirmation = response
		}).catch( e => {
			console.warn(e)
		}).then( ()=> {
			this.hideSpinner()
		})

	}

	getOrders( param ) {

		this.showOrdersBool = true

		this.showSpinner()

		this.wooProvider.get( 'orders/' + param, 'nopaging' ).then( response => {
			console.log(response)
			this.orders = response
		}).catch( e => {
			console.warn(e)
		}).then( ()=> {
			this.hideSpinner()
		})

	}

	showOrders() {

		if( !this.login_data ) {
			this.presentToast('Please login.')
			return;
		}

		this.showAccountBool = false;

		this.getOrders( '?customer=' + this.login_data.user_id + '&status=pending,processing,on-hold,completed,refunded,failed' )

	}

	showAccount() {

		if( !this.login_data ) {
			this.presentToast('Please login.')
			return;
		}

		this.showSpinner()

		this.showOrdersBool = false;
		this.showAccountBool = true;

		if( this.account ) {
			this.hideSpinner()
			return;
		}

		this.wooProvider.get( 'customers/' + this.login_data.user_id, 'nopaging' ).then( response => {
			console.log(response)
			this.account = response
		}).catch( e => {
			console.warn(e)
		}).then( ()=> {
			this.hideSpinner()
		})

		// sucks to do an extra http request, tried hard to avoid this
		this.wooProvider.getCustom( 'wp-json/appcommerce/v1/cart/misc' ).then( response => {

			if( response && (<any>response).account && (<any>response).account.url ) {
				this.accountUrl = (<any>response).account.url
			}
			
		}).catch( e => {
			console.warn(e)
		})

	}

	thanksContinue() {
		this.navCtrl.pop()
	}

	iabLink( url ) {

		this.iab.create( url, '_blank' )

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

	showLoginModal() {

		this.loginModal = this.modalCtrl.create('LoginModal' );

    	this.loginModal.present();
		
	}

	formatAvatar( url ) {
		if( url.indexOf('https') >= 0 ) {
			return url;
		} else {
			return 'https:' + url;
		}
	}

	showSpinner() {

        this.loading = this.loadingCtrl.create({
            showBackdrop: false,
            dismissOnPageChange: false
        });

        this.loading.present();

    }

    hideSpinner() {

    	if( this.loading )
    		this.loading.dismiss();
    }

}