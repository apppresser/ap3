import {Injectable} from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation';
import {Http} from '@angular/http';

/*
  AppGeo

*/
@Injectable()
export class AppGeo {

	private geolocation_options = {};
	private position_options = null;
	private url = '';
	private beacon_started = false;
	private interval_id = 0;
	private wordpress_url = '';

	constructor(private Geolocation: Geolocation, private http: Http) { }

	startBeacon(geouserpref) {

		console.log('start geolocation beacon');

		if(geouserpref.interval && geouserpref.wordpress_url) {
			if(this.position_options === null) {
				this.setCurrentPositionOptions(geouserpref);
			}
			
			if(this.position_options && this.beacon_started === false) {
				this.beacon_started = true;
				this.wordpress_url = geouserpref.wordpress_url;
				this.geoLocate_user();
				this.interval_id = this.start_userInterval(geouserpref.interval);
				console.log('start interval_id', this.interval_id);
			}
		} else {
			this.stopBeacon('No interval or wordpress_url supplied');
		}
	}

	stopBeacon(msg) {
		console.log('stop interval_id', this.interval_id);
		clearInterval(this.interval_id);
		console.log('geouser beacon stopped', msg);
		this.beacon_started = false;
	}

	start_userInterval(interval) {
		if(interval) {
			// check every 60 seconds
			return window.setInterval( () => {
				this.geoLocate_user();
			}, interval );
		} else {
			console.log('geouserpref interval not set');
		}
	};

	// store location data for user
	geoLocate_user() {
		this.Geolocation.getCurrentPosition().then((position) => {
            this.onSuccessGeoUser(position);
        }).catch((error) => {
			this.stopBeacon(error.message);
		});
	};

	getCurrentPositionOptions() {
		return this.position_options;
	}

	setCurrentPositionOptions(geouserdata) {
		let timeout, maximumAge, enableHighAccuracy;
		let default_options = {
			timeout: 5000,
			maximumAge: 3000,
			enableHighAccuracy: true,
		};
		let geolocation_options = geouserdata.options;

		if( typeof geolocation_options !== 'undefined' ) {

			// Timeout
			if( typeof geolocation_options.timeout !== 'undefined' ) {
				timeout = parseInt( geolocation_options.timeout );

				if( timeout && timeout >= 1000 ) { // really? at least one second
					default_options.timeout = timeout;
				}
			}

			// maximumAge
			if( typeof geolocation_options.maximumAge !== 'undefined' ) {
				maximumAge = parseInt( geolocation_options.maximumAge );

				if( maximumAge && maximumAge >= 1000 ) {
					default_options.maximumAge = maximumAge;
				}
			}

			// enableHighAccuracy
			if( typeof geolocation_options.enableHighAccuracy !== 'undefined' ) {
				enableHighAccuracy = parseInt( geolocation_options.enableHighAccuracy );

				default_options.enableHighAccuracy = ( enableHighAccuracy ); // force a boolean
			}
		}

		this.position_options = default_options;
	};

	onSuccessGeoUser(position) {

		console.log('longitude', position.coords.longitude);
		console.log('latitude', position.coords.latitude);

		let ajax_url = this.wordpress_url + 'wp-admin/admin-ajax.php?action=appp_geo_user';

		let coords = {
			accuracy: position.coords.accuracy,
			altitude: position.coords.altitude,
			altitudeAccuracy: position.coords.altitudeAccuracy,
			heading: position.coords.heading,
			latitude: position.coords.latitude,
			longitude: position.coords.longitude,
			speed: position.coords.speed
		};

		let data = {
			'position': coords,
			'longitude': position.coords.longitude,
			'latitude': position.coords.latitude
		}

		this.http.post(ajax_url, data).subscribe(
			data => {
				let response = data.json();
				if(response.success === false) {
					this.stopBeacon(response.data);
				}
			},
			error => {
				console.log(JSON.stringify(error.json()));
          	}
		);
	};

}