export class ProductionProc {

	constructor(private cli_params, private zip_basename) { }

	post_build_cleanup() {
		const exec = require('child_process').exec;
		let commands = [
			'rm -rf ../src/pages/page-*',
			'rm -rf builds/app_green_636'
		];
	}

	/**
	 * Copy, move and delete files where the need to go
	 */
	move_production_files() {
		var fail = false;
		let exec = require('child_process').exec;
		let execSync = require('child_process').execSync;
		const site_name = this.cli_params.site_name;
		const app_id = this.cli_params.app_id;
		const zip_basename = this.zip_basename;
		const app_dir = 'app_'+site_name+'_'+app_id;
		
		exec('rm builds/'+app_dir+'/'+zip_basename+'.zip', (error, stdout, stderr) => {
			if (error) {
				console.error(`exec error: ${error}`);
			}
		});
		exec('rm builds/'+app_dir+'/'+zip_basename+'/build/*', (error, stdout, stderr) => {
			if (error) {
				console.error(`exec error: ${error}`);
			}
		});
		
		execSync('mv builds/'+app_dir+'/page-* ../src/pages/');
		execSync('mv builds/'+app_dir+'/globalvars/globalvars.ts ../src/providers/globalvars/');
		
		setTimeout(() => {
			this.create_production_app();
		}, 3000);
		
	}

	create_production_app() {

		var fail = false;
		const exec = require('child_process').exec;
		const cmd  = 'cd ../ && npm run build --prod';

		// For that warm fuzzy feeling
		console.log('npm run build --prod');

		const child = exec(cmd, (error, stdout, stderr) => {
			if(error) {
				console.log(error);
				fail = true;
			}
			
			if(stdout) {
				console.log(stdout);
			}

			if(stderr) {
				console.log(stderr);
			}
		});

		child.on('exit', () => {
			if(!fail) {
				// just a little time to read the output of the npm run build
				setTimeout(() => {
					this.move_final_files();
				}, 2000);
			}
		});
		
	}

	move_final_files() {
		var fail = false;
		const exec = require('child_process').exec;
		const site_name = this.cli_params.site_name;
		const app_id = this.cli_params.app_id;
		const zip_basename = this.zip_basename;
		const app_dir = 'app_'+site_name+'_'+app_id;
		
		let commands = [
			'cd ../ && mv www/build/* mkpages/builds/'+app_dir+'/'+zip_basename+'/build/',
			'cd builds/'+app_dir+'/ && zip -r production-'+zip_basename+'.zip '+zip_basename
		];
		
		commands.forEach(cmd => {

			if(!fail) {
				exec(cmd, (error, stdout, stderr) => {
					if(error) {
						console.log(error);
						fail = true;
					}
					
					if(stdout) {
						console.log(stdout);
					}

					if(stderr) {
						console.log(stderr);
					}
				});
			}

		});
	}
}