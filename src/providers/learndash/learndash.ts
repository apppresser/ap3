import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';

@Injectable()
export class LdProvider {

  data: any = null;
  url: string;
  restBase: string;
  authString: string;
  httpOptions: any;
  itemParsed: any;
  currencySymbol: string;

  constructor(
    public http: HttpClient,
    public storage: Storage ) {

    let item = window.localStorage.getItem( 'myappp' );
    this.itemParsed = JSON.parse( item );
    this.url = this.itemParsed.wordpress_url;
    this.restBase = 'wp-json/ldlms/v1/';

  }

  /* Returns promise.
   * Usage: 
   */
  get( route, page ) {

    return new Promise( (resolve, reject) => {

      if( !route )
        reject({ data: { message: "No URL set. " } })

      var concat;

      // check if url already has a query param
      if( route.indexOf('?') > 0 ) {
        concat = '&';
      } else {
        concat = '?';
      }

      let url = this.url + this.restBase + route;

      // set pagination
      if( !page ) {
        page = 1
      }

      this.http.get( url )
        .subscribe(data => {

          this.data = data;

          resolve(this.data);
        },
        error => {
          // probably a bad url or 404
          reject(error);
          this.handleError(error)
        })

    }); // end Promise
    
  }

  // send( data, route ) {

  //   return new Promise( (resolve, reject) => {

  //     if( !data )
  //       reject({ data: { message: "No data." } })

  //     let url = this.url + this.restBase + route

  //     this.http.post( url, data, this.httpOptions )
  //       .subscribe(data => {

  //         this.data = data;

  //         resolve(this.data);
  //       },
  //       error => {
  //         // probably a bad url or 404
  //         reject(error);
  //         this.handleError(error)
  //       })

  //   }); // end Promise

  // }

  handleError(err) {
    console.warn(err);
  }

}