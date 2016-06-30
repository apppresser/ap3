import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the Styles provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Styles {
  data: any = null;
  url: string = 'http://10.0.1.12/wp-json/ap3/v1/colors';

  constructor(public http: Http) {}

  load() {

    // don't have the data yet
    return new Promise(resolve => {
      // We're using Angular Http provider to request the data,
      // then on the response it'll map the JSON data to a parsed JS object.
      // Next we process the data and resolve the promise with the new data.

      // need appp=2 because colors come from theme
    this.http.get( this.url + '?appp=2' )
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