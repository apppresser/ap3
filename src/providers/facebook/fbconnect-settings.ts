import {Injectable} from '@angular/core';
import {GlobalVars} from '../globalvars/globalvars';
import {Http} from '@angular/http';
import { Facebook } from '@ionic-native/facebook';

@Injectable()
export class FBConnect_App_Settings {

	public debug: boolean;
	public login_scope: string[];
	public me_fields: string;
	public l10n: any;
	public wordpress_url: string;
	public nonce: string;
	public app_ver = 3;

	constructor(
		private globalvars: GlobalVars,
		private http: Http,
		private facebook: Facebook
	) {
		this.debug = false;
		this.login_scope = ['email','public_profile','user_friends'];
		this.me_fields = 'email,name,picture';
		this.l10n = {
				login_msg:'Thanks for logging in, {{USERNAME}}!',
				fetch_user_fail:'Sorry, login failed',
				not_authorized:'Please log into this app.',
				fb_not_logged_in:'Please log into Facebook.',
				wp_login_error:'WordPress login error',
				login_fail:'Login error, please try again.'
		};

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
	}

	get_settings() {

		return new Promise((resolve, reject) => {

			if( Facebook && Facebook.installed() ) {
				let myappp: any = localStorage.getItem('myappp');

				if( myappp ) {
					myappp = JSON.parse(myappp);
					if(myappp && myappp.wordpress_url) {
						this.wordpress_url = myappp['wordpress_url'];
						this.get_remote_settings().then( data => {

							console.log('Facebook, we will update our settings', data);

							this.update_settings(data);
							resolve();
						});
					} else {
						reject('Facebook login requires your WP URL');
					}
				} else {
					reject('LocalStorage not set yet');
				}
			} else {
				reject('Facebook plugin not loaded');
			}
		});
	}

	/**
	 * 
	 * @param data from WordPress API response
	 */
	update_settings( data: any ) {
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

		console.log(this.wordpress_url);

		return new Promise((resolve, reject) => {
			
			this.http.post(this.wordpress_url + params, data).map(
				res => res.json()
			).subscribe(
				data => {
					console.log('data from wordpress');
					console.log(data);
					resolve(data);
				}
			);
		});
	}

	get_redirect_url(redirect_url: string) {

		if(redirect_url) {

			if( redirect_url.indexOf('?') === -1 && redirect_url.indexOf('appp=') === -1 ) {
				return redirect_url+ "?appp=" + this.app_ver;
			} else if( redirect_url.indexOf('appp=') === -1 ) {
				return redirect_url+ "&appp=" + this.app_ver;
			} else {
				return redirect_url;
			}
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
		this.facebook.logout();
		localStorage.removeItem('fb_avatar');
	}
	
	get_nonce() {
		return localStorage.getItem('fb_nonce');
	}

	set_nonce(security) {
		if(security)
			localStorage.setItem('fb_nonce', security);
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
}