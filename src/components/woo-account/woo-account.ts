import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { WooProvider } from '../../providers/woo/woo';
import {Storage} from '@ionic/storage';

@Component({
  selector: 'woo-account',
  templateUrl: 'woo-account.html',
})
export class WooAccountComponent implements OnInit {

	order_id: any
	orders: any
	title: string;
	login_data: any;
	customer: any;

	constructor(
		public navCtrl: NavController, 
		public navParams: NavParams,
		public wooProvider: WooProvider,
		public storage: Storage
		) {
	}

	ngOnInit() {
		this.order_id = this.navParams.get('order_id');

		console.log('order id: ' + this.order_id)

		this.title = ( this.navParams.get('title') ? this.navParams.get('title') : "Your Order" )

		if( this.order_id )
			this.getOrders( this.order_id )

		this.getCustomerOrders()
	}

	getCustomerOrders() {

		this.storage.get('user_login').then( login_data => {
			this.login_data = login_data
			if( login_data && login_data.user_id ) {
				this.customer = login_data.user_id
				this.getOrders( '?customer=' + login_data.user_id + '&status=pending,processing,on-hold,completed,refunded,failed' )
			}
		})
	}

	getOrders( param ) {

		this.wooProvider.get( 'orders/' + param, 'nopaging' ).then( response => {
			console.log(response)
			this.orders = response
		})

	}

	thanksContinue() {
		this.navCtrl.pop()
	}

}
