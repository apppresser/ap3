import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as crypto from 'crypto-js';

const API_SECRET = 'f86kgY2JY9V9QHhJOjMfP4b2YT7skHSo';
const CLIENT_ID = 6142119; //5348;
const SCOPE = 'all';
const LIVESTREAM_EVENT = '2549588';

@Injectable()
export class LiveStreamService {

	constructor(
		private http: HttpClient
	) {
		// console.log('LiveStreamService');
		let token = this.getToken();
		// console.log('token', token.toString());

		// this.getAccount( token.toString() );
		
	}

	getToken() {

		let sep = ':';
		let scope = 'all';
		let timestamp = Date.now();

		console.log('getToken', scope, timestamp);

		return crypto.HmacMD5(API_SECRET+sep+scope+sep+timestamp, API_SECRET);
	}

	getLiveStream() {
		return this.getVideo(LIVESTREAM_EVENT);
	}

	getVideo( eventId ) {

		return new Promise<string>((resolve, reject) => {
			let url = 'https://livestreamapis.com/v3/accounts/'+CLIENT_ID+'/events/'+eventId+'/videos';
			let headers = new HttpHeaders();
			
			headers = headers.append('Authorization', 'Basic ' + btoa(API_SECRET+':'));
			let options = {
				headers: headers
			};

			this.http.get(url, options).subscribe( resp => {
				console.log('video event response', resp);
				resolve((<any>resp).live.m3u8);
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