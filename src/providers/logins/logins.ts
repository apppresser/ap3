import { Injectable } from "@angular/core";
import { Storage } from "@ionic/storage";
import {Events} from 'ionic-angular';

import { FBConnect_App_Settings } from "../facebook/fbconnect-settings";

@Injectable()
export class Logins {

	private avatar;

	constructor(
		private storage: Storage,
		private events: Events,
		private fbconnectvars: FBConnect_App_Settings
	) {}

	set_force_login(status:boolean) {
		if(status)
			this.storage.set('force_login', true).then(() => {
				this.events.publish('login:force_login');
			});
		else
			this.storage.remove('force_login');
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

		return this.avatar;
	}

	get_fb_avatar() {
		return this.fbconnectvars.get_avatar();
	}
}