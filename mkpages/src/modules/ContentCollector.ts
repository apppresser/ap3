import { AppConfig } from "../AppConfig";
import https = require('https');
import http = require('http');
import fs = require('fs');
import path = require('path');

export class ContentCollector {

	private hostname: string;
	private port: number;
	
	constructor(private site_name: string) { 
		this.hostname = AppConfig.api.server.hostname;
		this.port     = AppConfig.api.server.port;
	}

	get_page_content_from_zip(page_id: string, page_slug: string, zip_folder_path: string) {

		let template_file = zip_folder_path.replace('mkpages/','') + '/build/' + page_slug + '.html';

		console.log('open template_file', template_file)

		return new Promise((resolve, reject) => {
			fs.readFile(template_file, 'utf8', (err, content) => {

				if(err) {
					console.log('read file err', err.message);
					reject('');
				} else {
					resolve(content);
				}
			});
		});
	}
	
	get_page_content_from_api(page_id: string) {
	
		return new Promise((resolve, reject) => {
			let req;
			const options = {
				hostname: this.hostname,
				port: this.port,
				method: 'GET',
				path: '/' + this.site_name + '/wp-json/wp/v2/apppages/' + page_id,
			};

			if(this.port == 80) {
				req = http.get(options, (res) => {
					res.on('data', (d) => {
						const json = JSON.parse(d.toString());
						if(json.content && json.content.rendered) {
							resolve(json.content.rendered);
						} else {
							reject('No content found for page id ' + page_id);
						}
					});

				}).on('error', (e) => {
					console.error(e);
					reject(e.message);
				});
			} else if(this.port == 443) {
				req = https.request(options, (res) => {
					let body = '';
					res.setEncoding('utf8');
					res.on('data', (chunk) => {
						try {
							body += chunk;
						} catch (error) {
							console.log('page_id: ' + page_id + ' did not contain a json response');
							reject('No content found for page id ' + page_id);
						}
					});
					res.on('error', (err) => {
						console.error('oops an err', err.message, err.stack);
					});
					res.on('end', () => {

						if( body.toString().indexOf('{') != 0 && body.toString().indexOf('Rate Limited.') > 0 ) {
							reject('Too many requests have been detected from this IP in the last minute.')
						} else if( body.toString().indexOf('{') != 0 ) {
							console.log(options, body.toString())
							reject(false);
						}
						try {
							const json = JSON.parse(body.toString());
							if(json.content && json.content.rendered) {
								resolve(json.content.rendered);
							} else {
								console.log('No content found for page id ' + page_id);
								resolve('');
							}
						} catch (error) {
							console.log('ERROR getting page content', options.hostname + options.path);
							reject(false);
						}
					});
				});

				req.on('error', function(e) {
					console.log('problem with request: ' + e.message);
					reject(e.message);
				});

				req.end();
			};
		});
	}
}