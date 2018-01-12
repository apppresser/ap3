export class ProductionProc {

	constructor(private cli_params, private zip_basename) { }

	post_build_cleanup() {
		const site_name = this.cli_params.site_name;
		const app_id = this.cli_params.app_id;
		const app_dir = 'app_'+site_name+'_'+app_id;
		const exec = require('child_process').exec;
		
		// reset globalvars.ts
		exec('mv builds/'+app_dir+'/bak/app.component.ts ../src/app/app.component.ts', () => { });
		exec('mv builds/'+app_dir+'/bak/globalvars.ts ../src/providers/globalvars/globalvars.ts', () => { });
		
		exec('rm -rf ../src/pages/page-*', () => {
			console.log('Done!');
		});
	}

	/**
	 * Copy, move and delete files where the need to go
	 */
	move_production_files() {
		let fail = false;
		let exec = require('child_process').exec;
		let execSync = require('child_process').execSync;
		let fs = require('fs');
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
		
		execSync('mv builds/'+app_dir+'/globalvars/globalvars.ts ../src/providers/globalvars/');
		
		// Custom pages may not exist
		exec('mv builds/'+app_dir+'/page-* ../src/pages/', () => {
			console.log('mv builds/'+app_dir+'/page-* ../src/pages/');	
		});

		// If there was an intro page
		if (fs.existsSync('builds/'+app_dir+'/app/app.component.ts')) {
			execSync('mv builds/'+app_dir+'/app/app.component.ts ../src/app/app.component.ts');
		}
		
		setTimeout(() => {
			this.create_production_app();
		}, 3000);
		
	}

	create_production_app() {

		var fail = false;
		const exec = require('child_process').exec;
		const cmd  = 'cd ../ && npm run build --prod';

		console.log('');
		console.log('');
		console.log('Buffering output, please wait . . .');
		console.log('');

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
					setTimeout(()=>{
						this.zip_production_files();
						setTimeout(()=>{
							this.post_build_cleanup();
						}, 5000);
					}, 5000);
				}, 10000);
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
			// 'cd builds/'+app_dir+'/ && zip -r production-'+zip_basename+'.zip '+zip_basename+' && echo "Your production app is ready!" && echo "Cleaning up . . ."'
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

	zip_production_files() {
		var fail = false;
		const exec = require('child_process').exec;
		const site_name = this.cli_params.site_name;
		const app_id = this.cli_params.app_id;
		const zip_basename = this.zip_basename;
		const app_dir = 'app_'+site_name+'_'+app_id;
		
		let commands = [
			'cd builds/'+app_dir+'/ && zip -r production-'+zip_basename+'.zip '+zip_basename+' && echo "Your production app is ready!" && echo "Cleaning up . . ."'
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