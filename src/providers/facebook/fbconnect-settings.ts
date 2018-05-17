import {Injectable} from '@angular/core';
import {GlobalVars} from '../globalvars/globalvars';
import {Http} from '@angular/http';
import { Facebook } from '@ionic-native/facebook';
import { Platform } from 'ionic-angular';
import { LoginService } from '../logins/login.service';

@Injectable()
export class FBConnectAppSettings {

	public debug: boolean;
	public login_scope: string[];
	public me_fields: string;
	public l10n: any;
	public wordpress_url: string;
	public wp_site_addr: string;
	public nonce: string;
	public app_ver = 3;

	constructor(
		private globalvars: GlobalVars,
		private http: Http,
		private facebook: Facebook,
		private loginservice: LoginService,
		private platform: Platform
	) {
		this.debug = false;
		this.login_scope = ['email','public_profile'];
		this.me_fields = 'email,name,picture';
		this.l10n = {
				login_msg:'Thanks for logging in, {{USERNAME}}!',
				fetch_user_fail:'Sorry, login failed',
				not_authorized:'Please log into this app.',
				fb_not_logged_in:'Please log into Facebook.',
				wp_login_error:'WordPress login error',
				login_fail:'Login error, please try again.'
		};

		this.platform.ready().then(platform => {
			if('object' === typeof window['facebookConnectPlugin']) {
				this.get_settings().then(
					() => {
						console.log('fb settings should be stored now');
					},
					(error) => {
						console.log(error);
						if(error == 'LocalStorage not set yet') {
							setTimeout(() => {
								this.get_settings()
							}, 3000); // let's try again in 3 seconds
							console.log('let\'s try again in 3 seconds')
						}
					}
				);
			} else {
				console.warn('cordova FacebookConnectPlugin is not installed');
			}
		});
	}

	get_settings() {

		return new Promise((resolve, reject) => {
			let myappp: any = localStorage.getItem('myappp');

			if( myappp ) {
				myappp = JSON.parse(myappp);
				if(myappp && myappp.wordpress_url) {
					this.wordpress_url = myappp['wordpress_url'];
					this.wp_site_addr = (myappp['wp_site_addr']) ? myappp['wp_site_addr'] : '';
					this.get_remote_settings().then( 
						data => {
							console.log('Facebook, we will update our settings', data);
							this.update_settings(data);
							resolve();
						},
						error => {
							console.warn(error);
							console.warn('Facebook login settings are not set. Now the Facebook login button will not display');
							this.set_nonce(false);
						}
					);
				} else {
					reject('Skipping remote login setup: no WP URL');
				}
			} else {
				reject('LocalStorage not set yet');
			}
		});
	}

	/**
	 * 
	 * @param data from WordPress API response
	 */
	update_settings( data: any ) {

		console.log('update_settings', data);

		if(data.security)
			this.set_nonce(data.security);

		if(data.l10n)
			this.l10n = data.l10n;

		if(data.me_fields)
			this.verify_me_fields(data.me_fields);
	}

	/**
	 * Call WordPress to get nonce for WPLogin
	 */
	get_remote_settings() {

		const params = 'wp-json/ap3/v1/appfbconnect/settings';
		const data = {id: this.globalvars.getAppId()};

		const wp_json_url = (this.wp_site_addr) ? this.wp_site_addr : this.wordpress_url;

		return new Promise((resolve, reject) => {
			
			this.http.post(wp_json_url + params, data).map(
				res => res.json()
			).subscribe(
				data => {
					console.log('data from wordpress', data);
					if(data && data.error) {
						reject(data.error);
					} else {
						resolve(data);
					}
				},
				error => {
					if(error.status && error.status == '404') {
						const msg = 'Using FB Login requires App Facebook Connect 2.6.0+ plugin on ' + this.wordpress_url;
						console.error(msg);
						reject(msg);
					}
				}
			);
		});
	}

	get_redirect_url(redirect_url: string) {
		if(redirect_url) {
			let url = new URL(redirect_url);
			url.searchParams.append('appp', this.app_ver.toString());
			return url.toString();
		} else {
			return false;
		}
	}

	verify_me_fields(me_fields) {
		// a wp developer can send their own fields
		if(me_fields) {
			this.me_fields = me_fields;

			// required fields for our app
			if(this.me_fields.indexOf('picture') < 0)
				this.me_fields += ',picture';
			if(this.me_fields.indexOf('name') < 0)
				this.me_fields += ',name';
			if(this.me_fields.indexOf('email') < 0)
				this.me_fields += ',email';
		}

		return this.me_fields;
	}

	loggout() {

		return new Promise((resolve, reject) => {

			if('object' === typeof window['facebookConnectPlugin']) {
				this.facebook.getLoginStatus().then( response => {
					if(response && response.status == 'connected') {
						this.facebook.logout()
					}
					resolve(response);
				});
			} else {
				console.warn('cordova FacebookConnectPlugin is not installed');
			}

			this.remove_avatar();
		});

		

		
	}
	
	get_nonce() {
		return localStorage.getItem('fb_nonce');
	}

	set_nonce(security) {
		if(security)
			localStorage.setItem('fb_nonce', security);
		else
			localStorage.removeItem('fb_nonce');
	}

	get_ajaxurl() {
		return this.wordpress_url + 'wp-admin/admin-ajax.php';
	}

	get_avatar() {
		return localStorage.getItem('fb_avatar');
	}

	set_avatar(response) {
		if(response && response.picture && response.picture.data.url)
			localStorage.setItem('fb_avatar', response.picture.data.url);
	}

	remove_avatar() {
		localStorage.removeItem('fb_avatar');
	}
}