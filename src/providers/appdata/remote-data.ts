import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import {Device} from '@ionic-native/device';
import {Storage} from '@ionic/storage';
import { GlobalVars } from '../globalvars/globalvars';
import { RemoteData } from "./remote-data.model";

@Injectable()
export class RemoteDataService {

	private apiUrl: string;
	private appId: string;

	constructor(
		private storage: Storage,
		private device: Device,
		private http: Http,
		private globalvars: GlobalVars
	) {
		this.apiUrl = this.globalvars.getApiRoot();
		this.appId = this.globalvars.getAppId();
	}

	/**
	 * Saves a RemoteData object to storage so we can send it later. Such as saving offline data
	 * or logging items before we know logging is enabled.
	 * 
	 * @param apiUrl Full URL to a endpoint to consume the data
	 * @param data Any kind of JSON object (use {error_msg: 'message'} for logging errors)
	 * @param options The options for the RemoteData object
	 */
	createRemoteData(apiUrl: string, data: object, options?: any) {
		let d = new RemoteData(apiUrl, options);
		d.data = data;

		this.storeData(d);
	}

	/**
	 * Adds a RemoteData object to storage
	 * 
	 * @param rData RemoteData object to store in storage
	 */
	storeData(rData: RemoteData) {
		this.storage.set(rData.getDbKey(), rData);
	}

	/**
	 * Loops through the data storage for matching types and matching API URLs
	 * and adds them to a collection so we can send that entire data
	 * collection in one API call.
	 * 
	 * @param type A way to catgorize data so we can send them in batches
	 * @param token A secret key
	 */
	sendStoredData(type: string, token: string) {
		let dataCollection: Array<any> = [];

		// group the data with the same API URL
		this.storage.forEach((value, key, i) => {
			if(key.indexOf('rdata-'+type) === 0) {
				if(Object.keys(dataCollection).indexOf(value.apiUrl) >= 0) {
					dataCollection[value.apiUrl].push(value);
				} else {
					dataCollection[value.apiUrl] = [];
					dataCollection[value.apiUrl].push(value);
				}
			}
		}).then( () => {
			// console.log('dataCollection.length', Object.keys(dataCollection).length, dataCollection);
			if(Object.keys(dataCollection).length) {

				Object.keys(dataCollection).forEach((key, index) => {
					// console.log('forEach collection', dataCollection[key], index);

					// send groups of data by the same URL
					this.send(dataCollection[key], token);
				});
			}
		});
	}

	/**
	 * Sends a collection of data to a single API in one call.
	 * 
	 * @param rdataCollection 
	 * @param token 
	 */
	send(rdataCollection: Array<RemoteData>, token: string) {

		let dbKeys = [];

		let data = {
			collection: [],
			type: rdataCollection[0].type,
			deviceId: this.device.uuid,
			appId: this.appId,
			token: token
		}

		rdataCollection.forEach(value => {

			dbKeys.push(this.getDbKey(value));

			data.collection.push({
				data:value.data,
				timestamp: value.timestamp
			});
		})

		// console.log('we want to send this stuff', data, 'to', rdataCollection[0].apiUrl);
		
		this.http.post(rdataCollection[0].apiUrl, data).toPromise().then( response => {
			console.log(response);
			console.log('now we can delete', dbKeys);
			dbKeys.forEach( key => {
				console.log('deleting this key from the db', key);
				this.deleteDbItem(key);
			});
		}).catch( error => {
			console.log('RemoteDataService send error', error);
		});
	}

	/**
	 * Creates a unique data key based on the type
	 * 
	 * @param data The RemoteData object
	 */
	getDbKey(data) {
		if(data.isLog)
			return 'rdata-log-' + data.type + '-' + data.guid.value;
		else if(data.type)
			return 'rdata-' + data.type + '-' + data.guid.value;
		else
			return 'rdata-' + data.guid.value;
	}

	/**
	 * Deletes a single item from the database
	 * 
	 * @param key guid database key
	 */
	deleteDbItem(key) {
		if(key && key.indexOf('rdata-') === 0) {
			this.storage.remove(key);
		}
	}

	/**
	 * Deletes a group of logs items from the database that match a specified type
	 * 
	 * @param type The portion of the guid key to match
	 */
	removeLogs(type) {
		if(type) {
			this.storage.forEach((value, key, i) => {
				if(key.indexOf('rdata-log-'+type) === 0) {
					this.deleteDbItem(this.getDbKey(value));
				}
			});
		}
	}
}