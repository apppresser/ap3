import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
// import {Device} from '@ionic-native/device';
import { GlobalVars } from '../globalvars/globalvars';
import { RemoteDataService } from "./remote-data";
import { RemoteData } from "./remote-data.model";


@Injectable()
export class ErrorLogService {

	private initialized: boolean = false;
	private apiUrl: string;
	private appId: string;
	private loggingEnabled = false;
	private token: string;

	constructor(
		private remoteData: RemoteDataService,
		private http: Http,
		private globalvars: GlobalVars
	) {
		this.apiUrl = this.globalvars.getApiRoot();
		this.appId = this.globalvars.getAppId();
	}

	/**
	 * Initialized from the AppData.checkForUpdates() which has a five second delay
	 * 
	 * @param data API app-data
	 */
	init(data) {

		this.initialized = true;

		if(data && data.error_logs) {
			this.enableLogging(data.error_logs.timestamp, data.error_logs.token);
			this.remoteData.sendStoredData('log-app-push', this.token);
		} else {
			console.log('error logging is [DISABLED] for myapppresser.com');
			this.clearRemoteDataLogs();
		}
		
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
	 * @param error_type string All error types will be prepended with 'app-'
	 */
	addLog(msg: string, error_type: string) {

		// Maybe too early do know if logging has been enabled, so save it to storage, then send it or delete once we know
		if(this.initialized == false) {

			// /wp-json/ap3/v1/remote/data/push/

			this.remoteData.createRemoteData(this.globalvars.getApiRoot() + `/wp-json/ap3/v1/error/add/app-${error_type}/${this.appId}`,
        		{error_msg: msg},
        		{
          			type: 'app-'+error_type,
          			isLog: true
        		}
			);
			return true;
		}


		if(this.loggingEnabled) {

			const endpoint = `wp-json/ap3/v1/error/add/app-${error_type}/${this.appId}`;
			let data = {
				error_msg: msg,
				token: this.token
			}
	
			this.http.post(this.apiUrl + endpoint, data).toPromise().then( response => {
				let status = response.json();
				console.log('API log', msg, status);
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

	clearRemoteDataLogs() {
		this.remoteData.removeLogs('app-push');
	}

	getLogs() {

	}
}