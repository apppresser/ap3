import {Injectable} from '@angular/core';
import {Storage} from '@ionic/storage';
import {Events} from 'ionic-angular';
import { FbConnect_Iframe } from "./facebook/login-iframe";
import { FBConnect_App_Settings } from "./facebook/fbconnect-settings";
import { Page } from "../../pages/page/page.model";

@Injectable()
export class Logins {

	public is_loggedin;
	public login_data;
	private avatar;

	constructor(
		private storage: Storage,
		private events: Events,
		private fbconnectvars: FBConnect_App_Settings,
		private fbconnectIframe: FbConnect_Iframe
	) {}

	get_loggedin_status() {
		this.storage.get('user_login').then((data) => {
			if(data) {
				this.is_loggedin = true;
			}
		});
	}

	fb_iframe_login() {
		this.fbconnectIframe.login();
	}

	force_login() {
		return (!this.login_data && this.storage.get('force_login'));
	}
	
	set_force_login(status:boolean) {
		if(status)
			this.storage.set('force_login', true).then(() => {
			this.events.publish('login:force_login');
		  });
		else
			this.storage.remove('force_login');
	}

	syncLoginStatus( data ) {
		
		// sync login status. If WP and app doesn't match up, fix it
	
		if( data.isloggedin == false && this.login_data ) {
	
			// logged out of WP but still logged into app: log out of app
			this.login_data = null
			this.storage.remove('user_login');
			this.events.publish( 'modal:logindata', null )
			this.events.publish( 'user:logout', null );
	
		} else if( data.isloggedin == true && !this.login_data ) {
	
			// logged into WP but logged out of app: log into app
			if( data.avatar_url && data.message ) {
				this.login_data = { loggedin: true, avatar: this.get_avatar(data.avatar_url), message: data.message }
			} else {
				this.login_data = { loggedin: true }
			}
			
			this.storage.set('user_login', this.login_data ).then( () => {
	
				this.events.publish( 'modal:logindata', this.login_data )
	
			});
			
		}

		return this.login_data;
	
	}

	get_avatar( avatar ) {

		if(this.avatar != null)
			return this.avatar;

		let avatar_url: string;
		if(typeof(avatar) == 'object' && avatar.avatar_url)
			avatar_url = avatar
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

	/**
	 * Handle the appp_login_redirect filter from WordPress
	 * @param data Login data
	 * @return page Page
	 */
	get_login_redirect(data: any) : Page {
	
		let page: Page;

		if(data.login_redirect) {
			console.log('redirecting to ' + data.login_redirect);

			if(typeof data.login_redirect === 'string') {
				page = <Page>{ 
					title: '',
					url: data.login_redirect,
					component: 'Iframe',
					class: null,
					target: '',
					extra_classes: '',
				};
			} else if(typeof data.login_redirect === 'object') {
				page = <Page>{
					title: data.login_redirect.title,
					url: data.login_redirect.url,
					component: 'Iframe',
					class: null,
					target: '',
					extra_classes: '',
				};
			}
		}
	
		return page;
	}
}