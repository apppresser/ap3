import { Injectable } from "@angular/core";
import { Platform } from "ionic-angular";
import { Dialogs } from '@ionic-native/dialogs';
import {TranslateService} from '@ngx-translate/core';
import { GlobalVars } from "../globalvars/globalvars";

declare var navigator: any;
declare var Connection: any;

@Injectable()
export class ApppNetworkService {
	constructor(
		private platform: Platform,
		private Dialogs: Dialogs,
		private globalvars: GlobalVars,
		private translate: TranslateService
	) {}

	isConnected() {
		return (navigator.connection.type != 'none');
	}

	maybeNotConnected(dialog?: {message, title, btnText}) {

		if(!dialog) {
			dialog = {
				message: this.globalvars.offline.dialog.message,
				title: this.globalvars.offline.dialog.message,
				btnText: this.globalvars.offline.dialog.message
			}
		}

		return new Promise((resolve, reject) => {
			if(this.isConnected()) {
				resolve(true);
			} else {
				this.Dialogs.alert(
					this.translate.instant(dialog.message),
					this.translate.instant(dialog.title),
					this.translate.instant(dialog.btnText)
				);
				resolve(false);
			}
		});
	}
	
	getConnectionType() {
		this.platform.ready().then(() => {
			return navigator.connection.type;
		});
	}

	getConnectionState( networkState ) {
		var states = {};
		states[Connection.UNKNOWN]  = 'Unknown connection';
		states[Connection.ETHERNET] = 'Ethernet connection';
		states[Connection.WIFI]     = 'WiFi connection';
		states[Connection.CELL_2G]  = 'Cell 2G connection';
		states[Connection.CELL_3G]  = 'Cell 3G connection';
		states[Connection.CELL_4G]  = 'Cell 4G connection';
		states[Connection.CELL]     = 'Cell generic connection';
		states[Connection.NONE]     = 'No network connection';

		return states[networkState];
	}
}