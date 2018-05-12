import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class HeaderLogo {
	url: string;
	logo_exists: boolean;

  constructor(
    public http: Http
    ) {
  	this.url = 'assets/header-logo.png'
  }

  checkLogo() {

    return new Promise( (resolve, reject) => {

			if(this.logo_exists) {
				// logo exists, we already checked
				resolve(this.url);
			} else if(this.logo_exists === false) {
				// logo does not exists, we already checked
				reject();
			} else {

				// not sure if logo exists, check please

				this.http.get( './assets/header-logo.png' )
						.subscribe(data => {

							this.logo_exists = true;
	
							// logo file exists, return url 
							resolve(this.url);
						},
						error => {

							this.logo_exists = false;
	
							// logo file does not exist
							reject(error);
						});
			}

	    });
  }

}