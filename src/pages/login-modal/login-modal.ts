import { Component } from '@angular/core';
import { NavController, NavParams, Events, ViewController, ToastController } from 'ionic-angular';
import {WPlogin} from '../../providers/wplogin/wplogin';
import { Storage } from '@ionic/storage';
import {Device} from 'ionic-native';

/*
  Generated class for the LoginModal page.

*/
@Component({
  selector: 'page-login-modal',
  templateUrl: 'login-modal.html'
})
export class LoginModal {

	login:any = {}
	login_data: any

	constructor(
		public navCtrl: NavController, 
		public navParams: NavParams,
		public viewCtrl: ViewController,
		public wplogin: WPlogin,
		public events: Events,
		public storage: Storage
		) {

		this.storage.get('user_login').then( data => {

			if(data) {
			  this.login_data = data
			}
		});

	}

	doLogin() {

		if( !Device.platform ) 
			alert('Please try from a device.')

		if( !this.login )
			alert('Please enter a valid login.')

		this.wplogin.login( this.login ).then( response => {
			console.log(response)
			this.storage.set( 'user_login', (<any>response).data )
			this.events.publish('user:login', (<any>response).data )
			this.login_data = (<any>response).data
			this.dismiss()
		}, (err) => {

			let msg = "There was a problem, please try again. ";

			if( err.data.message )
				msg += err.data.message

			alert( msg )
		})
	}

	doLogout() {

		this.wplogin.logout().then( response => {
			console.log( response )
			this.storage.remove( 'user_login' )
			this.events.publish('user:logout' )
			this.login_data = null
			this.dismiss()
			// TODO: redirect away from a loggedin page?
		}, (err) => {

			let msg = "There was a problem, please try again. ";

			if( err.data.message )
				msg += err.data.message

			alert( msg )
		})

	}

	dismiss() {
		this.viewCtrl.dismiss();
	}

}