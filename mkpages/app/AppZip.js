"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs"); // nodejs filesystem
class AppZip {
    constructor(myappp_settings, cli_params) {
        this.myappp_settings = myappp_settings;
        this.cli_params = cli_params;
        this.filename = this.myappp_settings.meta.appZip.split('/').pop();
        this.dest_dir = './builds/app_' + this.cli_params.site_name + '_' + this.cli_params.app_id + '/';
    }
    get_app_zip(dest_dir) {
        if (this.myappp_settings && this.myappp_settings.meta && this.myappp_settings.meta.appZip) {
            const http = require('http');
            const file = fs.createWriteStream(dest_dir + this.filename);
            const request = http.get(this.myappp_settings.meta.appZip, (response) => {
                response.pipe(file);
                this.create_zip_dir();
            });
        }
        else {
            console.log('Zip file not found.');
        }
    }
    create_zip_dir() {
        this.zip_dir = './builds/app_' + this.cli_params.site_name + '_' + this.cli_params.app_id + '/' + this.filename.replace('.zip', '');
        const exec = require('child_process').exec;
        const cmd = 'mkdir ' + this.zip_dir;
        exec(cmd, (error, stdout, stderr) => {
            console.log(stdout);
            console.log('this.unzip_app(this.filename, dest_dir, zip_dir);');
        });
        console.log('getting ' + this.filename);
    }
    unzip_app(filename, dest_dir, zip_dir) {
        const cmd = 'unzip ' + dest_dir + filename + ' -d ' + zip_dir;
        // + ' && ' +
        // 'rm ' + dest_dir + filename;
    }
}
exports.AppZip = AppZip;
