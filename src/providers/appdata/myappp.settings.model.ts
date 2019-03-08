export class MyApppSettings {

	public title: string;
	public id: number;
	public meta: {
		name: string,
		menu: string,
		tab_menu: string,
		appZip: string,
		app_update_version: number,
		design: any,
		light_status_bar: boolean,
		menu_right: any,
		rtl: boolean,
		share: any,
		intro_slug: string
	};
	public error_logs: boolean;
	public ads:{
		ios: any,
		android: any
	};
	public vendors: any;
	public segments: any;
	public languages: Array<any>;
	public default_language: string;
	public assets: any;
	public menus: {items: Array<any>, name: ''};
	public tab_menu: {items: Array<any>, name: ''};
	public side_menu_login;
	public side_menu_force_login;
	public wordpress_url;
	public show_registration_link;
	public registration_url;
	public wp_site_addr;
	public menu_all_pages;

	constructor() {
		
	}
}