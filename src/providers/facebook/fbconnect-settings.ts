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

	constructor(
		private globalvars: GlobalVars,
		private http: Http
	) {
		this.debug = false;
		this.login_scope = ['email','public_profile','user_friends'];
		this.me_fields = 'email,name';
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
		if(data.security) {
			this.nonce = data.security;
			localStorage.setItem('fb_nonce', this.nonce);
		}

		if(data.l10n) {
			this.l10n = data.l10n;
		}

		if(data.me_fields) {
			this.me_fields = data.me_fields;
		}
	}

	get_nonce() {
		return localStorage.getItem('fb_nonce');
	}

	get_ajaxurl() {
		return this.wordpress_url + 'wp-admin/admin-ajax.php';
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
}