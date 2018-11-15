import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { WooProvider } from '../../providers/woo/woo';
import {Storage} from '@ionic/storage';
import {InAppBrowser, InAppBrowserObject} from '@ionic-native/in-app-browser';

@Component({
  selector: 'woo-account',
  templateUrl: 'woo-account.html',
})
export class WooAccountComponent implements OnInit {

	order_id: any;
	orders: any;
	account: any;
	orderConfirmation: any;
	title: string;
	login_data: any;
	customer: any;
	loading: any;
	wpUrl: string;
	showOrdersBool: boolean = false;
	showAccountBool: boolean = false;

	constructor(
		public navCtrl: NavController, 
		public navParams: NavParams,
		public wooProvider: WooProvider,
		public storage: Storage,
		public loadingCtrl: LoadingController,
		public iab: InAppBrowser,
		public toastCtrl: ToastController
		) {
	}

	ngOnInit() {

		let item = window.localStorage.getItem( 'myappp' );
    	this.wpUrl = JSON.parse( item ).wordpress_url;

		this.order_id = this.navParams.get('order_id');

		console.log('params', this.navParams)

		this.title = ( this.navParams.get('title') ? this.navParams.get('title') : "Your Order" )

		this.storage.get('user_login').then( login_data => {

			this.login_data = login_data

			if( this.order_id ) {
				this.getOrder( this.order_id )
			} else {
				this.getCustomerOrders()
			}

		})
		
	}

	getCustomerOrders() {

		if( this.login_data && this.login_data.user_id ) {
			this.customer = this.login_data.user_id
			this.getOrders( '?customer=' + this.login_data.user_id + '&status=pending,processing,on-hold,completed,refunded,failed' )
		} else {
			this.presentToast('Please login.')
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
	}

	thanksContinue() {
		this.navCtrl.pop()
	}

	siteLink( pageSlug ) {

		this.iab.create( this.wpUrl + pageSlug, '_blank' )

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