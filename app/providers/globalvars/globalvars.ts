import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Store global variables to use throughout app

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class GlobalVars {

  data: any = null;
  url: string = 'http://10.0.1.12/';

  constructor( public http: Http ) {}

  getUrl() {
    return this.url;
  }

  // Get AppPresser settings from API
  getSettings() {

    let settingsUrl = this.url + 'wp-json/ap3/v1/settings';

    return new Promise(resolve => {
      // We're using Angular Http provider to request the data,
      // then on the response it'll map the JSON data to a parsed JS object.
      // Next we process the data and resolve the promise with the new data.

      this.http.get( settingsUrl )
        .map(res => res.json())
        .subscribe(data => {
          // we've got back the raw data, now generate the core schedule data
          // and save the data for later reference
          this.data = data;
          console.warn(data);
          resolve(this.data);
        });
    });

  }

}