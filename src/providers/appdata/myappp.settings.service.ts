import { MyApppSettings } from "./myappp.settings.model";

export class MyApppSettingsService {

	public settings: MyApppSettings;
	public realTabMenu: Array<any>;

	constructor() {}

	setData(data) {
		this.settings = <MyApppSettings>data;
		console.log('settings', this.settings);
	}

	isForcedLogin() {
		return (this.settings.side_menu_force_login == 'on');
	}

	isPreview() {

		if(window.location && window.location.href) {
			if(window.location.href.indexOf('localhost') >=0) {
				console.log('isPreview', true)
				return true;
			} else if(window.location.href.indexOf('myapppresser') >=0) {
				console.log('isPreview', true)
				return true;
			}
		}

		console.log('isPreview', false)
		return false;
	}

	hasTabsMenu() {
		return (this.settings.tab_menu && this.settings.tab_menu.items && this.settings.tab_menu.items.length);
	}
}