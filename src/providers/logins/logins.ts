import { Injectable } from "@angular/core";
import { Storage } from "@ionic/storage";
import {Events} from 'ionic-angular';

import { FBConnectAppSettings } from "../facebook/fbconnect-settings";

@Injectable()
export class Logins {

	private avatar;

	constructor(
		private storage: Storage,
		private events: Events,
		private fbconnectvars: FBConnectAppSettings
	) {}

	set_force_login(status:boolean) {

		if(status) {
			this.storage.get('user_login').then(data => {

				// only show the login modal when logged out

				if(data) {
					console.log('do not show logout modal');
				} else {
					this.events.publish('login:force_login');
				}
			});
	
	
			this.storage.set('force_login', true).then(() => {
				// nothing
			});
		} else {
			this.storage.remove('force_login');
		}
	}

	/**
	 * use FB avatar for FB logins and
	 * use WP avatar for WP logins
	 * 
	 * @param avatar string or json
	 * @return avatar
	 */
	get_avatar( avatar: any ) : string|null {

		let avatar_url: string;
		if(typeof(avatar) == 'object' && avatar.avatar_url)
			avatar_url = avatar.avatar_url;
		else if(typeof(avatar) == 'object' && avatar.avatar)
			avatar_url = avatar.avatar;
		else if(typeof(avatar) == 'string') {
			avatar_url = avatar;
		}
		
		let fb_avatar = this.get_fb_avatar();

		if(fb_avatar)
			this.avatar = fb_avatar;
		else
			this.avatar = avatar_url;
		
		this.avatar = this.fixProtocolRelativeUrl(this.avatar);

		return this.avatar;
	}

	get_fb_avatar() {
		return this.fbconnectvars.get_avatar();
	}

	/**
	 * If a URL has a relative protocol, //gravatar.com, we need to force one
	 * 
	 * @param url 
	 * @param protocol Default: https
	 */
	fixProtocolRelativeUrl(url: string, protocol?: string) {

		if(!url)
			return '';

		protocol = protocol ? protocol : 'https';

		if (url.indexOf('//') === 0)
			return protocol + ':' + url;
		else
			return url;
	}
}