import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import { HttpParams } from '@angular/common/http';

import { User } from "../../models/user.model";
import { Events } from "ionic-angular";

@Injectable()
export class LoginService {
	private userObs = new Subject<User>();
	public user: User;
	private wp_reset_password_url = '';

	constructor(
		private events: Events
	) {}

	setLoginStatus(user: User) {
		this.user = user;
		this.userObs.next(this.user);
	}

	removeLoginStatus() {
		this.user = null;
		this.userObs.next(null);
	}

	loginStatus(): Observable<User> {
		// return the observable
		return this.userObs;
	}

	getPasswordResetUrl() {

		if(!this.wp_reset_password_url) {
			let item = window.localStorage.getItem( 'myappp' );
			let wpurl = JSON.parse( item ).wordpress_url;

			this.wp_reset_password_url = this.appendUrlModalLogin(wpurl);
		}

		return this.wp_reset_password_url;

	}

	appendUrlModalLogin(url) {

		let params = new HttpParams();

		// gather any #
		let url_parts = url.split('#');
		let hash = '#app-lost-password';
	
		// gather any ?
		url_parts = url_parts[0].split('?');
		let base_url = url_parts[0];
		let query = url_parts[1];

		if(query && url.indexOf('appp=3') >= 0) {
			// already has appp=3
			params = new HttpParams({
				fromString: query
			});
		} else {
			// add the appp=3
			params = new HttpParams({
				fromString: (query) ? query+'&appp=3':'appp=3'
			});
		}
	
		// put it all together
		url = base_url + '?' + params.toString() + hash;

		// remove empty params
		url = url.replace('&=&', '&');
	
		return url;
	
	  }

	/**
	 * Open the login modal if the menu item's extra_classes contains 'yieldlogin'
	 * @param navParams
	 */
	yieldLogin(navParams) {
		if(navParams && navParams.extra_classes && navParams.extra_classes.indexOf('yieldlogin') >= 0) {
			if(this.user) { // logged in
				return false;
			} else { // logged out, show login modal
				console.log('yieldLogin');
				this.events.publish('login:force_login');
				return true;
			}
		}

		return false;
	}
}