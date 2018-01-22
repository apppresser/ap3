"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AppConfig_1 = require("../AppConfig");
const fs = require("fs"); // nodejs filesystem
const path = require("path"); // nodejs directory utilities
class AppZip {
    constructor(myappp_settings, cli_params) {
        this.myappp_settings = myappp_settings;
        this.cli_params = cli_params;
        this.ran_once = false;
        this.dest_dir = path.normalize('./builds/app_' + this.cli_params.site_name + '_' + this.cli_params.app_id + '/');
        this.hostname = AppConfig_1.AppConfig.api.server.hostname;
        this.port = AppConfig_1.AppConfig.api.server.port;
        console.log(this.dest_dir);
    }
    get_app_zip() {
        return new Promise((resolve, reject) => {
            if (this.myappp_settings && this.myappp_settings.meta && this.myappp_settings.meta.appZip) {
                this.filename = this.myappp_settings.meta.appZip.split('/').pop();
                this.zip_basename = this.filename.replace('.zip', '');
                this.create_unzip_dir();
                console.log('getting ' + this.filename);
                const http = require('http');
                const https = require('https');
                console.log('createWriteStream: ' + this.dest_dir + this.filename);
                const file = fs.createWriteStream(this.dest_dir + this.filename);
                if (this.port == 80) {
                    file.on('finish', () => {
                        console.log('finished saving zip');
                        this.unzip_app().then(success => {
                            resolve(this.filename);
                        });
                    });
                    const request = http.get(this.myappp_settings.meta.appZip, (response) => {
                        response.pipe(file);
                    });
                }
                else if (this.port == 443) {
                    const options = {
                        hostname: this.hostname,
                        port: this.port,
                        path: this.myappp_settings.meta.appZip.replace(this.hostname, ''),
                        method: 'GET'
                    };
                    const request = https.request(this.myappp_settings.meta.appZip, (res) => {
                        res.on('data', (data) => {
                            file.write(data);
                        });
                        res.on('end', () => {
                            console.log('finished saving zip');
                            this.unzip_app().then(sucess => {
                                resolve(this.filename);
                            });
                        });
                    });
                    request.end();
                    request.on('error', (e) => {
                        console.error(e);
                        reject('');
                    });
                    request.on('complete', () => {
                        console.log('request complete downloading ' + this.filename);
                        resolve(this.filename);
                    });
                }
                else {
                    console.log('Incorrect port getting zip file');
                    reject('');
                }
            }
            else {
                console.log('Zip file not found.');
                reject('');
            }
        });
    }
    create_unzip_dir() {
        this.unzip_dir = './builds/app_' + this.cli_params.site_name + '_' + this.cli_params.app_id + '/' + this.filename.replace('.zip', '');
        const exec = require('child_process').exec;
        const cmd = 'mkdir ' + this.unzip_dir;
        exec(cmd, (error, stdout, stderr) => {
            console.log(stdout);
        });
    }
    unzip_app() {
        return new Promise((resolve, reject) => {
            const exec = require('child_process').exec;
            const cmd = 'unzip ' + this.dest_dir + this.filename + ' -d ' + this.unzip_dir;
            console.log(cmd);
            const child = exec(cmd);
            child.on('exit', () => {
                console.log('unzip done');
                resolve(true);
                // setTimeout(() => {
                // 	const prod = new ProductionProc(this.cli_params, this.zip_basename);
                // 	if(this.ran_once === false ) {
                // 		console.log('move_production_files');
                // 		prod.move_production_files();
                // 		this.ran_once = true;
                // 	}
                // }, 3000);
            });
        });
    }
}
exports.AppZip = AppZip;
