import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the Posts provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Posts {
  data: any = null;

  constructor(public http: Http) {}

  load(url:string, page) {

    // set pagination
    if( !page ) {
      let page = '1';
    }
      
    // if (this.data) {
    //   // already loaded data
    //   return Promise.resolve(this.data);
    // }

    return new Promise(resolve => {

      // check if url already has a query param
      if( url.indexOf('?') > 0 ) {
        var concat = '&';
      } else {
        var concat = '?';
      }

    this.http.get( url + concat + 'appp=3&page=' + page)
        .map(res => res.json())
        .subscribe(data => {
          // we've got back the raw data, now generate the core schedule data
          // and save the data for later reference
          this.data = data;

          // this.storage.set( url.substr(-10, 10) + '_posts', data);

          // console.warn(data);
          resolve(this.data);
        });
    });
  }

}

