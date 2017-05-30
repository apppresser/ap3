"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AppConfig_1 = require("../AppConfig");
const https = require("https");
const http = require("http");
class AppSettings {
    constructor(site_name, app_id) {
        this.site_name = site_name;
        this.app_id = app_id;
        this.hostname = AppConfig_1.AppConfig.api.server.hostname;
        this.port = AppConfig_1.AppConfig.api.server.port;
    }
    get_settings() {
        return new Promise((resolve, reject) => {
            let req;
            const options = {
                hostname: this.hostname,
                port: this.port,
                method: 'GET',
                path: '/' + this.site_name + '/wp-json/ap3/v1/app/' + this.app_id,
            };
            if (this.port == 80) {
                req = http.get(options, (res) => {
                    res.on('data', (d) => {
                        resolve(JSON.parse(d.toString()));
                    });
                }).on('error', (e) => {
                    console.error(e);
                    reject(e.message);
                });
            }
            else if (this.port == 443) {
                req = https.request(options, (res) => {
                    res.setEncoding('utf8');
                    res.on('data', (chunk) => {
                        resolve(JSON.parse(chunk.toString()));
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
exports.AppSettings = AppSettings;
