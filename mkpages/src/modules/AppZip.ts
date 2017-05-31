import { ProductionProc } from "./ProductionProc";
import fs = require('fs'); // nodejs filesystem
import path = require('path'); // nodejs directory utilities


export class AppZip {

	private filename;
	private dest_dir;
	private unzip_dir;
	private zip_basename;

	constructor(private myappp_settings, private cli_params) {
		this.dest_dir = path.normalize('./builds/app_'+this.cli_params.site_name+'_'+this.cli_params.app_id+'/');

		console.log(this.dest_dir);
	}

	get_app_zip() {

		if(this.myappp_settings && this.myappp_settings.meta && this.myappp_settings.meta.appZip) {

			this.filename = this.myappp_settings.meta.appZip.split('/').pop();
			this.zip_basename = this.filename.replace('.zip', '');
			
			console.log('getting ' + this.filename);
			
			const http = require('http');
			
			const file = fs.createWriteStream(this.dest_dir + this.filename);
			const request = http.get(this.myappp_settings.meta.appZip, (response) => {
				response.pipe(file);
				this.create_unzip_dir();
			});
			file.on('finish', () => {
				console.log('finished saving zip');
				this.unzip_app();
			});

		} else {
			console.log('Zip file not found.');
		}
	}

	create_unzip_dir() {
		this.unzip_dir  = './builds/app_'+this.cli_params.site_name+'_'+this.cli_params.app_id+'/'+this.filename.replace('.zip', '');

		const exec = require('child_process').exec;
		const cmd = 'mkdir ' + this.unzip_dir;
		exec(cmd, (error, stdout, stderr) => {
			console.log(stdout);
		});
	}

	unzip_app() {
		const exec = require('child_process').exec;
		const cmd = 'unzip ' + this.dest_dir + this.filename + ' -d ' + this.unzip_dir;
		console.log(cmd);
		const child = exec(cmd);
		child.on('exit', () => {

			setTimeout(() => {
				const prod = new ProductionProc(this.cli_params, this.zip_basename);
				prod.move_production_files();
			}, 3000);
		});
		
		
	}
}