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

		// login through postmessage sets login_data this way
		events.subscribe('modal:logindata', data => {
	      this.setLoginData(data);
	    });

		// get login data on first load
		this.storage.get('user_login').then( data => {

			if(data) {
			  this.login_data = data
			}

		});

	}

	doLogin() {

		// if in preview, Device.platform is empty object. On device it should be string like 'iOS'
		if( typeof Device.platform != 'string' ) {

			alert('Please try from a device.');

			return;

		}

		if( !this.login )
			alert('Please enter a valid login.')

		this.wplogin.login( this.login ).then( response => {

			this.storage.set( 'user_login', (<any>response).data )
			this.events.publish('user:login', (<any>response).data )
			this.login_data = (<any>response).data
			this.dismiss()

		}, (err) => {

			console.log(err)

			let msg = "There was a problem, please try again. ";

			if( err.data && err.data.message )
				msg += err.data.message

			alert( msg )
		}).catch( e => {
			console.warn(e)
			alert("There was a problem connecting to the server.")
		})
	}

	doLogout() {

		this.wplogin.logout().then( response => {

			this.storage.remove( 'user_login' )
			this.events.publish('user:logout' )
			this.login_data = null
			this.dismiss()

		}, (err) => {

			this.storage.remove( 'user_login' )
			this.events.publish('user:logout' )
			this.login_data = null

			console.log(err)

			let msg = "You are logged out of the app, but there was a problem on the server. ";

			if( err.data && err.data.message )
				msg += err.data.message

			alert( msg )
		}).catch( e => {
			console.warn(e)
			alert("There was a problem connecting to the server.")
		})

	}

	setLoginData( data ) {
		this.login_data = data
	}

	dismiss() {
		this.viewCtrl.dismiss();
	}

}