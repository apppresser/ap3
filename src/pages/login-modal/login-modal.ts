import { Component } from '@angular/core';
import { Events, ViewController, ToastController, LoadingController, IonicPage } from 'ionic-angular';
import {WPlogin} from '../../providers/wplogin/wplogin';
import { Storage } from '@ionic/storage';
import {Device} from '@ionic-native/device';
import {TranslateService} from '@ngx-translate/core';

import { Avatar } from "../../providers/wplogin/avatar";

@IonicPage()
@Component({
  selector: 'page-login-modal',
  templateUrl: 'login-modal.html'
})
export class LoginModal {

	login:any = {}
	login_data: any
	spinner: any

	constructor(
		public viewCtrl: ViewController,
		public loadingCtrl: LoadingController,
		public wplogin: WPlogin,
		public events: Events,
		public storage: Storage,
		public translate: TranslateService,
		private avatar: Avatar,
		private Device: Device
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
		if( typeof this.Device.platform != 'string' ) {

			this.translate.get('Please try from a device.').subscribe( text => {
				alert(text);
			})

			return;

		}

		this.translate.get('Please enter a valid login.').subscribe( text => {
			if( !this.login )
				alert(text)
		})

		this.showSpinner()

		this.wplogin.login( this.login ).then( response => {

			if( (<any>response).success === false ) {
				this.loginErr( response )
				return;
			}

			let login_data = (<any>response).data;
			if(login_data && login_data.avatar)
				login_data.avatar = this.avatar.fixProtocolRelativeUrl(login_data.avatar);

			this.storage.set( 'user_login', login_data )
			this.events.publish('user:login', login_data )
			this.login_data = login_data
			this.dismiss()

			this.hideSpinner()

		}, (err) => {

			this.loginErr(err)

		}).catch( e => {
			console.warn(e)
			this.hideSpinner()
			this.translate.get('There was a problem connecting to the server.').subscribe( text => {
				alert(text);
			});
		})
	}

	loginErr( err ) {

		console.log(err)

		this.hideSpinner()

		this.translate.get('There was a problem, please try again.').subscribe( text => {
			let msg = text;

			if( err.data && err.data.message )
				msg += ' ' + err.data.message

			alert( msg )
		});

	}

	doLogout() {

		this.showSpinner()

		this.wplogin.logout().then( response => {

			this.storage.remove( 'user_login' )
			this.events.publish('user:logout' )
			this.login_data = null
			this.dismiss()
			this.hideSpinner()

		}, (err) => {

			this.storage.remove( 'user_login' )
			this.events.publish('user:logout' )
			this.login_data = null
			this.hideSpinner()

			console.log(err)

			this.translate.get('You are logged out of the app, but there was a problem on the server.').subscribe( text => {
				let msg = text;

				if( err.data && err.data.message )
					msg += ' ' + err.data.message

				alert( msg )
			})
		}).catch( e => {
			console.warn(e)
			this.hideSpinner()
			this.translate.get('There was a problem connecting to the server.').subscribe( text => {
				alert(text)
			})
		})

	}

	setLoginData( data ) {
		this.login_data = data
		console.log('setLoginData', this.login_data)
	}

	dismiss() {
		this.viewCtrl.dismiss();
	}

	showSpinner() {
		this.spinner = this.loadingCtrl.create();

		this.spinner.present();
	}

	hideSpinner() {
		this.spinner.dismiss();
	}

}