import { Component } from '@angular/core';
import { Events, ViewController, LoadingController, IonicPage, ToastController, NavParams, Platform } from 'ionic-angular';
import {DomSanitizer} from '@angular/platform-browser';
import {WPlogin} from '../../providers/wplogin/wplogin';
import {Logins} from "../../providers/logins/logins";
import {FbConnectApp} from '../../providers/facebook/login-app';
import {FbConnectIframe} from '../../providers/facebook/login-iframe';
import {FBConnectAppSettings} from '../../providers/facebook/fbconnect-settings';
import {Storage} from '@ionic/storage';
import {Device} from '@ionic-native/device';
import {TranslateService} from '@ngx-translate/core';
import { LoginService } from '../../providers/logins/login.service';
import {BpProvider} from '../../providers/buddypress/bp-provider';

@IonicPage()
@Component({
  selector: 'page-login-modal',
  templateUrl: 'login-modal.html'
})
export class LoginModal {

	login:any = {}
	user_data: any = {}
	pw_reset: any = {}
	login_data: any
	spinner: any
	force_login: any = false;
	is_preview: boolean = false;
	fb_login: boolean = false;
	fb_login_data: any
	api_register_setting: any;
	show_verification_field: boolean = false;
	title: string = '';
	show_registration: boolean = false;
	show_pw_reset: boolean = false;
	show_reset_code: boolean = false;
	iframeUrl: any;
	customClasses: string;
	iphoneX: boolean = false;

	constructor(
		public navParams: NavParams,
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
		private Device: Device,
		private bpProvider: BpProvider,
		private platform: Platform,
		private sanitizer: DomSanitizer
		) {
      
		if(this.navParams.get('title')) {
			this.title = this.navParams.get('title');
		} else {
			this.title = 'Login';
		}

		// login through postmessage sets login_data this way
		events.subscribe('modal:logindata', data => {
	      this.setLoginData(data);
		});
		
		platform.resume.subscribe ( (e) => {
			this.getScreen()
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

		this.storage.get('api_register_setting').then( data => {

			if( data ) {
				this.api_register_setting = data
			}

		})

		this.checkUnverified();

		this.initFBLogin();

		this.is_preview = (location.href.indexOf('myapppresser') > 0);

		this.doIphoneX()

	}

	ionViewWillEnter() {

		// save the screen we were on last
		this.getScreen()

	}

	// if we are in the middle of a pw reset or registration, show correct fields
	getScreen() {

		this.storage.get( 'login_screen' ).then( screen => {

			if( screen === 'show_verification_field' ) {

				this.show_verification_field = true;
				this.show_registration = true;
				this.checkUnverified()

			} else if( screen === 'show_reset_code' ) {
				this.show_pw_reset = true
				this.show_reset_code = true
				this.show_registration = false
			}

		})

	}

	checkUnverified() {

		this.storage.get( 'unverified_user' ).then( data => {

			if( data ){
				this.show_verification_field = true;
				this.show_registration = true;
				this.user_data = data
			}

		})

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

		this.translate.get('Please enter a valid login.').subscribe( text => {
			if( !this.login )
				this.presentToast(text);
		})

		this.showSpinner()

		// safety just in case
		setTimeout( () => {
			if( this.spinner )
				this.hideSpinner()
		}, 15000 );

		this.wplogin.login( this.login ).then( response => {

			if( !response || (<any>response).success === false ) {
				this.loginErr( response )
				return;
			}

			let login_data = (<any>response);
			if(login_data && login_data.avatar)
				login_data.avatar = this.logins.fixProtocolRelativeUrl(login_data.avatar);

			this.loginSuccess( login_data )
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

	loginSuccess( login_data ) {

		this.storage.set( 'user_login', login_data )
		this.events.publish('user:login', login_data )
		this.login_data = login_data

		this.maybeSetCookie( login_data )

		// clean up
		this.resetRegistration()

	}

	maybeSetCookie( login_data, logout = false ) {

		// only do this in the browser
		if( this.platform.is('ios') || this.platform.is('android') ) {
			this.dismiss()
			return;
		}

		console.log('Setting cookie via iframe because we are in the browser.')

        let myappp = JSON.parse( window.localStorage.getItem( 'myappp' ) );
        let url = myappp.wordpress_url;

        // maybe add token to set cookie. This fixes an issue where auth cookie was not set because of API login
        if( logout ) {
        	url = url + '?appp=3&wp_logout=true'
            this.storage.remove( 'wp_logout' );
        } else if( login_data && login_data.cookie_auth && login_data.cookie_auth != '' ) {
            url = url + '?appp=3&cookie_auth=' + login_data.cookie_auth
            login_data.cookie_auth = '';
            this.storage.set( 'user_login', login_data );
        }

        this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl( url );

        console.log('iframe url ' + url )

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

	showResetPassword() {
		
		this.show_pw_reset = true
		this.show_registration = false

	}

	doResetPassword() {

		console.log(this.pw_reset)

		if( !this.pw_reset.email && !this.pw_reset.code ) {
			this.presentToast("Please fill out required fields.")
			return;
		}

		this.showSpinner()

		this.wplogin.resetPassword( this.pw_reset ).then( data => {

			console.log(data)

			// sent reset code, show the code field
			if( (<any>data).got_code ) {
				this.show_reset_code = true;
				this.storage.set( 'login_screen', 'show_reset_code' )
			}

			// password has been changed, need user to login
			if( (<any>data).pw_changed ) {

				if( this.pw_reset.email ) 
					this.login.user = this.pw_reset.email

				setTimeout( () => {
					this.show_pw_reset = false
					this.storage.remove( 'login_screen' )
				}, 800)
			}
			
			this.presentToast( (<any>data).message )
			this.hideSpinner()

		}).catch( e => {
			this.handleErr( e )
			this.hideSpinner()
		})

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
			this.storage.set( 'wp_logout', true );
			this.maybeSetCookie( null, true )
			this.events.publish('user:logout', response )
			this.login_data = null
			this.hideSpinner()

		}, (err) => {

			this.storage.remove( 'user_login' )
			this.storage.set( 'wp_logout', true );
			this.maybeSetCookie( null, true )
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
	}

	register( e ) {

		if( this.api_register_setting && this.api_register_setting.url === "" ) {
			this.show_registration = true
		} else {

			let title = e.target.innerText

			this.dismiss()

			this.events.publish('pushpage', { url: this.api_register_setting.url, title: title, is_register_page: true } )

		}

	}

	showVerificationField() {
		this.show_verification_field = true;
	}

	doApiRegistration() {

		console.log(this.user_data)

		if( !this.user_data.email || !this.user_data.username || !this.user_data.password ) {
			this.presentToast("Please fill out required fields.")
			return;
		}

		this.showSpinner()

		// if we are submitting a verification code, verify and login. Otherwise, register as unverified user
		if( this.user_data.verification ) {
			this.verify(this.user_data)
		} else {
			this.wplogin.register( this.user_data ).then( data => {
				console.log(data)
				
				this.show_verification_field = true;

				this.storage.set( 'login_screen', 'show_verification_field' )

				this.storage.set( 'unverified_user', this.user_data )

				this.presentToast(data)
				this.hideSpinner()

			}).catch( e => {
				this.handleErr( e )
				this.hideSpinner()
			})
		}

	}

	// verify user after registration, login if successful
	verify( user_data ) {

		this.wplogin.verifyUser( this.user_data ).then( data => {
			console.log(data)
			
			if( (<any>data).success ) {

				this.presentToast('Success! You have been registered.')
				this.loginSuccess( data )
				this.show_verification_field = false;
				this.show_registration = false;
				this.storage.remove( 'unverified_user' )
				this.storage.remove( 'login_screen' )

			} else if( (<any>data).message ) {

				this.presentToast( (<any>data).message )

			}
			
			this.hideSpinner()

		}).catch( e => {

			this.handleErr( e )

			this.hideSpinner()
		})

	}

	resendCode() {

		if( !this.user_data || !this.user_data.email || !this.user_data.username ) {
			this.presentToast('Please enter your email and username, then try again.')
			return;
		}

		this.showSpinner()

		this.wplogin.resendCode( this.user_data ).then( data => {
			console.log(data)
			
			if( data ) {
				this.presentToast('Verification code resent.')
			} else {
				this.presentToast('Verification code was not sent, please check your server email settings.')
			}

			this.hideSpinner()

		}).catch( e => {
			this.handleErr( e )
			this.hideSpinner()
		})

	}

	resetRegistration() {
		this.storage.remove( 'unverified_user' ).then( data => {
			this.show_verification_field = false
			this.user_data.verification = null
		})

		this.storage.remove( 'login_screen' )
	}

	showLoginForm() {
		this.show_registration = false;
		this.show_pw_reset = false;
		this.show_reset_code = false;
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

		this.translate.get(msg).subscribe( translation => {

		  let toast = this.toastCtrl.create({
		    message: msg,
		    duration: 3000,
		    position: 'bottom'
		  });

		  toast.present();

		})

	}

	handleErr( err ) {

		console.error('Error with registration', err);
		let msg = "There was a problem, please try again.";
		if( err['_body'] && JSON.parse( err['_body'] ).message ) {
		  msg += ' ' + JSON.parse( err['_body'] ).message;
		}
		this.presentToast( msg );

	}

	doIphoneX() {

		// hack for iphonex status bar
		if( this.Device && this.Device.model ) {
		  let model = this.Device.model.toLowerCase();

		  if( model.indexOf('iphone10') >= 0 ) {

		    this.iphoneX = true;

		    if( this.platform.isLandscape() ) {
		      this.customClasses = 'iphoneX-landscape'
		    } else {
		      this.customClasses = 'iphoneX-portrait'
		    }
		    
		  }
		}

	}

}