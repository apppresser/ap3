import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import { Network } from '@ionic-native/network';

@Injectable()
export class NetworkStatusService {

	private connectionObs = new Subject<boolean>();
	public currentStatus: boolean = null;

	constructor(
		private network: Network
	) {
		this.initNetworkWatch();
	}

	networkStatus(): Observable<boolean> {
		// return the observable
		return this.connectionObs;
	}

	/**
	 * 
	 * @param wait optional How long to wait which confirms we have truely lost a connection
	 */
	initNetworkWatch(wait?: number) {

		wait = (wait) ? wait : 3000;

		// Initial status
		if (this.network.type === 'none') {
			this.connectionObs.next(false);
			this.currentStatus = false;
		} else {
			this.connectionObs.next(true);
			this.currentStatus = true;
		}
		
		// Subscribe to changes
		this.network.onchange().subscribe(() => {
			console.log('networkstatusservice: network type', this.network.type);

			// Only change the app's network status if the network type changes and stays
			// consisent for X seconds (wait variable)
			let current_type = this.network.type;

			// filter out the frequent changes
			setTimeout(() => {
				if (this.network.type == 'none' && this.network.type == current_type) {
					this.connectionObs.next(false);
					this.currentStatus = false;
				} else if (this.network.type != 'none' && this.network.type == current_type) {
					this.connectionObs.next(true);
					this.currentStatus = true;
				}
			}, wait);
		});

		
	}
}