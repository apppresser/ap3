import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class HeaderLogo {
  url: string;

  constructor(
    public http: Http
    ) {
  	this.url = 'assets/header-logo.png'
  }

  checkLogo() {

    return new Promise( (resolve, reject) => {

	    this.http.get( './assets/header-logo.png' )
	        .subscribe(data => {

	          // logo file exists, return url 
	          resolve(this.url);
	        },
	        error => {

	          // logo file does not exist
	          reject(error);
	        })
	    });
  }

}