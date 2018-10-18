import { Injectable } from "@angular/core";
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { Angulartics2 } from 'angulartics2';

// Needs some variables from the window
declare var window;
declare var document;
declare var Date;
declare var ga;

@Injectable()
export class AnalyticsService {

	private isEnabled: boolean = false;
	private isDuplicate: boolean = false;
	private basepath = 'apppresser/';

	constructor(
		private ga: Angulartics2GoogleAnalytics,
		private angulartics2: Angulartics2
	) {}

	beginTracking(tracking_id: string, basename: string) {
		
		this.isEnabled = true;

		if(basename) {
			this.basepath = basename + '/';
		}

		(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');


		// Use localstorage instead of cookies
		const GA_LOCAL_STORAGE_KEY = 'ga:clientId';
		ga('create', tracking_id, {
		  'storage': 'none',
		  'clientId': localStorage.getItem(GA_LOCAL_STORAGE_KEY)
		});
		
		ga(function(tracker) {
		  localStorage.setItem(GA_LOCAL_STORAGE_KEY, tracker.get('clientId'));
		});
	
		// allow file:// URLs for our app
		ga('set', 'checkProtocolTask', function(){ /* noop */});
	}

	trackScreenView(component: string, screenname: string) {

		if(!this.isEnabled)
			return;

		if(!this.isDuplicate) {
			this.setNoDuplicates();
			// https://github.com/angulartics/angulartics2/blob/master/src/lib/providers/ga/ga.ts
			this.ga.pageTrack(this.basepath + component + '/#/' + screenname);

			// console.log(this.basepath + component + '/#/' + screenname);
		}
	}

	private setNoDuplicates() {
		if( this.isDuplicate )
			return;
		
		this.isDuplicate = true;

		setTimeout(() => {
			this.isDuplicate = false;
		}, 1000);
	}

	trackEvent(event: string, label?: string) {

		if(!this.isEnabled)
			return;

		let properties: {category,label?} = {
			category: 'app'
		};

		if(label)
			properties.label = label;

		this.angulartics2.eventTrack.next({ 
			action: event,
			properties: properties,
		  });
	}

}