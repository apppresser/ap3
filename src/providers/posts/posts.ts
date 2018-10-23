import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import {Storage} from '@ionic/storage';

/*
  Generated class for the Posts provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Posts {
  data: any = null;

  constructor(
    public http: Http, 
    public storage: Storage
    ) {}

  load(url:string, page) {

    // set pagination
    if( !page ) {
      let page = '1';
    }
      
    // if (this.data) {
    //   // already loaded data. this is handled elsewhere for now
    //   return Promise.resolve(this.data);
    // }

    return new Promise( (resolve, reject) => {

      var concat;

      // check if url already has a query param
      if( url && url.indexOf('?') > 0 ) {
        concat = '&';
      } else {
        concat = '?';
      }

      this.storage.get('app_language').then( lang => {

        let language = ''

        if(lang && typeof(lang) === 'object') {
          language = '&lang=' + lang.code;
        } else if(lang && typeof(lang) === 'string') {
          language = '&lang=' + lang;
        }

        this.http.get( url + concat + 'appp=3&page=' + page + language)
            .map(res => res.json())
            .subscribe(data => {

              this.data = data;

              resolve(this.data);
            },
            error => {
              // probably a bad url or 404
              reject(error);
            })
        });


      })
  }

}

