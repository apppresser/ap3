import { AppConfig } from "../AppConfig";
import https = require('https');
import http = require('http');

export class AppSettings {

	private hostname: string;
	private port: number;

	constructor(private site_name: string, private app_id: string) {
		this.hostname = AppConfig.api.server.hostname;
		this.port     = AppConfig.api.server.port;
	}

	get_settings() {
	
		return new Promise((resolve, reject) => {
			let req;
			const options = {
				hostname: this.hostname,
				port: this.port,
				method: 'GET',
				path: '/' + this.site_name + '/wp-json/ap3/v1/app/' + this.app_id,
				headers: {
					'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
					'Pragma': 'no-cache'
				}
			};

			if(this.port == 80) {
				req = http.get(options, (res) => {
					res.on('data', (d) => {
						resolve(JSON.parse(d.toString()));
					});

				}).on('error', (e) => {
					console.error(e);
					console.log('API failed', options);
					reject(e.message);
				});
			} else if(this.port == 443) {
				https.request(options, (res) => {
					res.setEncoding('utf8');
					let data = '';
					res.on('data', (chunk) => {
						data += chunk;
					}).on('end', () => {
						try{
							resolve(JSON.parse(data.toString()));
						} catch(e) {
							console.error(e.message);
							console.log('API failed', options);
						}
					})
				}).on('error', function(e) {
					console.log('problem with request: ' + e.message);
					reject(e.message);
				}).on('end', ()=>{
					console.log('request end event');
				}).end();
			};
		});
	}
}