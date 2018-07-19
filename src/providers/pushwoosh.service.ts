import { Injectable } from '@angular/core';
import { Platform, Events } from 'ionic-angular';
import { Dialogs } from '@ionic-native/dialogs';
import {TranslateService} from '@ngx-translate/core';
import { LiveStreamService } from './video/livestream.service';

declare var window;

const PUSHWOOSH_APP_ID = '8BEFA-42AAF';
const GOOGLE_PROJECT_NUMBER = '928356289655';
const MPNS_SERVICE_NAME = '';  // windows
// const API_ACCESS = 'HAJAQdHUVFigSFWKKAv2PPs68SupceX8UpRuHpvAfNPPZZIlsdQseYfyjTLV3SMIwSb3sFXlZSosdjTkFgF1';



@Injectable()
export class PushwooshService {

	public pushwoosh: any;

	constructor(
		private platform: Platform,
		private events: Events,
		public translate: TranslateService,
		private Dialogs: Dialogs,
		private livestream: LiveStreamService
	) {
		this.platform.ready().then(() => {

			if(window && window.cordova) {
				this.pushwoosh = window.cordova.require("pushwoosh-cordova-plugin.PushNotification");

				// Should be called before pushwoosh.onDeviceReady
				// fires when user taps the push notification when the app is closed
				window.document.addEventListener('push-notification', (event) => {
					// handle push open here
					let notification = event.notification;

					console.log('PushwooshService push-notification event notification', event, notification);

					this.pushwoosh.setApplicationIconBadgeNumber(0);
				});

				// fires when the app is open
				window.document.addEventListener('push-receive', (event) => {
					// handle push open here
					let notification = event.notification;

					console.log('PushwooshService push-receive event notification', event, notification);

					

					this.pushwoosh.setApplicationIconBadgeNumber(0);

					let title   = (notification && notification.title) ? notification.title : 'Title';
					let message = (notification && notification.message) ? notification.message : 'Message';

					if(notification && (notification.message || notification.title)) {
						this.Dialogs.confirm(
							message,
							title,
							[this.translate.instant('Read'),this.translate.instant('Cancel')],
						).then( () => {
								if(notification.userdata && notification.userdata.url) {
									this.events.publish('pushpage', {
										url: notification.userdata.url
									});
								}
							}
						);
						// this.Dialogs.alert(
						// 	message,  // message
						// 	title,    // title
						// 	this.translate.instant('Done')  // buttonName						
						// );
					} else {
						console.log('notification message and title not found');
					}
				});
		
				// Initialize Pushwoosh. This will trigger all pending push notifications on start.
				this.pushwoosh.onDeviceReady({
					appid: PUSHWOOSH_APP_ID,
					projectid: GOOGLE_PROJECT_NUMBER,
					// serviceName: MPNS_SERVICE_NAME
				});

				console.log('pushwoosh ready');

				this.registerDevice();
				this.pushwoosh.setApplicationIconBadgeNumber(0);
			} else {
				console.warn('Pushwoosh cordova plugin was not loaded.');
			}
		});
	}

	registerDevice() {
		this.pushwoosh.registerDevice(
			function(status) {
				var pushToken = status.pushToken;

				console.log('PushwooshService registerDevice pushToken', pushToken);
				// handle successful registration here
		  },
		  function(status) {
			// handle registration error here

			console.log('PushwooshService registerDevice error', status);
		  }
		);
	}

	test() {
		let event = new CustomEvent('push-notification');
      	window.document.dispatchEvent(event);
	}
}