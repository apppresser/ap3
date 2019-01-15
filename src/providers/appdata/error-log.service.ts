import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import {Device} from '@ionic-native/device';
import { GlobalVars } from '../globalvars/globalvars';


@Injectable()
export class ErrorLogService {

	private apiUrl: string;
	private appId: string;
	private loggingEnabled = false;
	private token: string;

	constructor(
		private http: Http,
		private globalvars: GlobalVars
	) {
		this.apiUrl = this.globalvars.getApiRoot();
		this.appId = this.globalvars.getAppId();
	}

	/**
	 * Enabled by fetchData data.enable_error_logs,
	 * but only if has been recently enabled on myapppresser.com
	 */
	enableLogging(timestamp, token) {

		let expireTime = new Date(parseInt(timestamp)*1000);
		let now = new Date();

		// Only log for two hours
		expireTime.setHours(expireTime.getHours() + 2);

		if(expireTime.getTime() > now.getTime()) {
			this.token = token;
			this.loggingEnabled = true;
			console.log('error logging is [ENABLED] for myapppresser.com');
		} else {
			console.log('error logging has [EXPIRED] for myapppresser.com');
		}

	}

	/**
	 * Add an error to myapppresser.com
	 * 
	 * example: this.errorlogs.addLog('log this error', 'push');
	 * 
	 * @param msg string
	 * @param error_type string Prepend all error types with 'app-'
	 */
	addLog(msg: string, error_type: string) {

		if(this.loggingEnabled) {

			if(error_type.indexOf('app-') === -1) {
				alert('error_type must begin with app-');
				return;
			}

			const endpoint = `wp-json/ap3/v1/error/add/${error_type}/${this.appId}`;
			let data = {
				error_msg: msg,
				token: this.token
			}
	
			this.http.post(this.apiUrl + endpoint, data).toPromise().then( response => {
				let status = response.json();
				console.log('API error log', status, msg);
				if(status.logging_disabled) {
					this.loggingEnabled = false;
					console.log('Logging for myapppresser.com is being disabled');
				}
			});

			return true;
		} else {
			return false;
		}
	}

	getLogs() {

	}
}