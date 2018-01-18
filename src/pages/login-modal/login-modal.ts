import { Component } from '@angular/core';
import { Events, ViewController, LoadingController, IonicPage, ToastController } from 'ionic-angular';
import {WPlogin} from '../../providers/wplogin/wplogin';
import {Logins} from "../../providers/logins/logins";
import {FbConnectApp} from '../../providers/facebook/login-app';
import {FbConnectIframe} from '../../providers/facebook/login-iframe';
import {FBConnectAppSettings} from '../../providers/facebook/fbconnect-settings';
import {Storage} from '@ionic/storage';
import {Device} from '@ionic-native/device';
import {TranslateService} from '@ngx-translate/core';
import { LoginService } from '../../providers/logins/login.service';

@IonicPage()
@Component({
  selector: 'page-login-modal',
  templateUrl: 'login-modal.html'
})
export class LoginModal {

	login:any = {}
	login_data: any
	spinner: any
	force_login: any = false;
	is_preview: boolean = false;
	fb_login: boolean = false;
	fb_login_data: any
	register_link: string = ''

	constructor(
		public viewCtrl: ViewController,
		public loadingCtrl: LoadingController,
		public wplogin: WPlogin,
		private logins: Logins,
		public events: Events,
		public storage: Storage,
		public translate: TranslateService,
		private fbconnectApp: FbConnectApp,
		private fbconnectvars: FBConnectAppSettings,
		private toastCtrl: ToastController,
		private loginservice: LoginService,
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

		this.storage.get('force_login').then( data => {
			if(data) {
				this.force_login = true;
			}
		})

		this.storage.get('registration_url').then( data => {

			if(data) {
				this.register_link = data;
			} else {
				this.register_link = null
			}
		})

		this.initFBLogin();

		this.is_preview = (location.href.indexOf('myapppresser') > 0);

	}

	/**
	 * The FB login button will only display after settings are received
	 * 
	 * fb_login: true|false to show the button
	 */
	initFBLogin() {
		this.fb_login = (this.fbconnectvars.get_nonce()) ? true : false;

		if(this.fb_login === false) {
			setTimeout(()=>{

				this.fb_login = (this.fbconnectvars.get_nonce()) ? true : false;

				if(this.fb_login === false) {
					setTimeout(()=>{
		
						this.fb_login = (this.fbconnectvars.get_nonce()) ? true : false;
					}, 5000); // iOS seems to take longer
				}
			}, 3000); // Slow on first app load
		}
	}

	doLogin() {

		// if in preview, Device.platform is empty object. On device it should be string like 'iOS'
		// checking for port 8100 let's me test logins locally
		if( typeof this.Device.platform != 'string' && location.port != '8100') {

			this.translate.get('Please try from a device.').subscribe( text => {
				this.presentToast(text);
			})

			return;

		}

		this.translate.get('Please enter a valid login.').subscribe( text => {
			if( !this.login )
				this.presentToast(text);
		})

		this.showSpinner()

		this.wplogin.login( this.login ).then( response => {

			if( !response || (<any>response).success === false ) {
				this.loginErr( response )
				return;
			}

			let login_data = (<any>response).data;
			if(login_data && login_data.avatar)
				login_data.avatar = this.logins.fixProtocolRelativeUrl(login_data.avatar);

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
				this.presentToast(text);
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

			this.presentToast(msg);
		});

	}

	doFBLogin() {

		if( typeof this.Device.platform != 'string' && location.port != '8100') {
			
			this.translate.get('Please try from a device.').subscribe( text => {
				this.presentToast(text);
			})

			return;
		}

		this.events.subscribe('fb:login', data => {
			console.log('captured fb login event', data);
			this.dismiss();
			if(data.redirect_url)
				this.events.publish('user:login_redirect', data.redirect_url);
		});
		this.fbconnectApp.login();
	}

	doLogout() {

		this.showSpinner();

		this.fbconnectvars.loggout();
		this.loginservice.removeLoginStatus();

		this.wplogin.logout().then( response => {

			this.storage.remove( 'user_login' )
			this.events.publish('user:logout', response )
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

				this.presentToast(msg);
			})
		}).catch( e => {
			console.warn(e)
			this.hideSpinner()
			this.translate.get('There was a problem connecting to the server.').subscribe( text => {
				this.presentToast(text);
			})
		})

	}

	setLoginData( data ) {
		this.login_data = data
		console.log('setLoginData', this.login_data)
	}

	register( e ) {

		let title = e.target.innerText

		this.dismiss()

		this.events.publish('pushpage', { url: this.register_link, title: title, backbtn: false } )

	}

	lostpw( e ) {

		let title = e.target.innerText

		this.dismiss()

		let item = window.localStorage.getItem( 'myappp' );
    	let url = JSON.parse( item ).wordpress_url;

		this.events.publish('pushpage', { url: url + 'wp-login.php?action=lostpassword', title: title } )
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

	presentToast(msg) {

	    let toast = this.toastCtrl.create({
	      message: msg,
	      duration: 5000,
	      position: 'bottom'
	    });

	    toast.present();

	}

}