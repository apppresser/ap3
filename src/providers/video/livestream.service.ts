import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as crypto from 'crypto-js';

const API_SECRET = '';
const ACCOUNT_ID = 6142119;
const CLIENT_ID = 5348;
const SCOPE = 'all';
const LIVESTREAM_EVENT = '2549588';

@Injectable()
export class LiveStreamService {

	constructor(
		private http: HttpClient
	) {
		// console.log('LiveStreamService');
		// let token = this.getToken();
		// console.log('token', token.toString());

		// this.getAccount( token.toString() );

		console.log('@TODO - set livestream API Key');
		
	}

	getToken( timestamp ) {

		let sep = ':';
		let scope = 'all';
		
		console.log('getToken', scope, timestamp);

		// Pure luck
		// https://livestreamapis.com/v3/accounts/6142119/events/2549588/videos?timestamp=1518132164740&clientId=5348&token=38d2b2f6ffa4d9af39eff51d56d5641c
		
		return crypto.HmacMD5(API_SECRET+sep+scope+sep+timestamp, API_SECRET);
	}

	getTokenUrlParams() {
		
		let timestamp = Date.now();
		let token = this.getToken( timestamp );

		return `?timestamp=${timestamp}&clientId=${CLIENT_ID}&token=${token}`;
	}
	
	getLiveStream() {
		return this.getVideo(LIVESTREAM_EVENT);
	}
	
	getVideo( eventId ) {

		// https://livestream.com/developers/docs/api/#secure-tokens

		/**
		 * Example
		 * GET https://livestreamapis.com/v3/accounts?timestamp={timestamp}&clientId={clientId}&token={token}
		 */
		
		return new Promise<any>((resolve, reject) => {

			let url = `https://livestreamapis.com/v3/accounts/${ACCOUNT_ID}/events/${eventId}/videos`;

			url = url + this.getTokenUrlParams();

			let headers = new HttpHeaders();
			
			headers = headers.append('Authorization', 'Basic ' + btoa(API_SECRET+':'));
			let options = {
				headers: headers
			};

			this.http.get(url, options).subscribe( resp => {
				console.log('video event response', resp);

				let videoJson = (<any>resp);
				
				// LIVE
				// if(typeof videoJson == 'object' && videoJson.live) {
				// 	resolve(videoJson.live);
				// 	return;
				// }

				// VODS???
				if(typeof videoJson == 'object' && videoJson.vods) {
					if(videoJson.vods.data && videoJson.vods.data.length && videoJson.vods.data.length > 0 ) {
						let video = videoJson.vods.data[0].data;
						resolve(video);
						return;
					}
				}

				reject('video not found');

			}, (err) => {
				console.log('video event error', err);
				reject(err.toString());
			});
		});
	}

	getAccount( token ) {

		let url = 'https://livestreamapis.com/v1/accounts';
		let headers = new HttpHeaders();
		
		headers = headers.append('Authorization', 'Basic ' + btoa(API_SECRET+':'));
		let options = {
			headers: headers
		};

		this.http.get(url, options).subscribe( resp => {
			console.log('livestreamapis response', resp);
		}, (err) => {
			console.log('livestreamapis error', err);
		});
	}
}