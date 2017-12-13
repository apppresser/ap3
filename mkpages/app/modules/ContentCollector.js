"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AppConfig_1 = require("../AppConfig");
const https = require("https");
const http = require("http");
class ContentCollector {
    constructor(site_name) {
        this.site_name = site_name;
        this.hostname = AppConfig_1.AppConfig.api.server.hostname;
        this.port = AppConfig_1.AppConfig.api.server.port;
    }
    get_page_content(page_id) {
        return new Promise((resolve, reject) => {
            let req;
            const options = {
                hostname: this.hostname,
                port: this.port,
                method: 'GET',
                path: '/' + this.site_name + '/wp-json/wp/v2/apppages/' + page_id,
            };
            if (this.port == 80) {
                req = http.get(options, (res) => {
                    res.on('data', (d) => {
                        const json = JSON.parse(d.toString());
                        if (json.content && json.content.rendered) {
                            resolve(json.content.rendered);
                        }
                        else {
                            reject('No content found for page id ' + page_id);
                        }
                    });
                }).on('error', (e) => {
                    console.error(e);
                    reject(e.message);
                });
            }
            else if (this.port == 443) {
                req = https.request(options, (res) => {
                    let body = '';
                    res.setEncoding('utf8');
                    res.on('data', (chunk) => {
                        try {
                            body += chunk;
                        }
                        catch (error) {
                            console.log('page_id: ' + page_id + ' did not contain a json response');
                            reject('No content found for page id ' + page_id);
                        }
                    });
                    res.on('error', (err) => {
                        console.error('oops an err', err.message, err.stack);
                    });
                    res.on('end', () => {
                        if (body.toString().indexOf('{') != 0 && body.toString().indexOf('Rate Limited.') > 0) {
                            reject('Too many requests have been detected from this IP in the last minute.');
                        }
                        else if (body.toString().indexOf('{') != 0) {
                            console.log(options, body.toString());
                            reject(false);
                        }
                        const json = JSON.parse(body.toString());
                        if (json.content && json.content.rendered) {
                            resolve(json.content.rendered);
                        }
                        else {
                            console.log('No content found for page id ' + page_id);
                            resolve('');
                        }
                    });
                });
                req.on('error', function (e) {
                    console.log('problem with request: ' + e.message);
                    reject(e.message);
                });
                req.end();
            }
            ;
        });
    }
}
exports.ContentCollector = ContentCollector;
