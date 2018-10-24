import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';

@Injectable()
export class WooProvider {

  data: any = null;
  url: string;
  authString: string;

  constructor(
    public http: HttpClient,
    public storage: Storage ) {

    let item = window.localStorage.getItem( 'myappp' );
    let url = JSON.parse( item ).wordpress_url;
    let restBase = 'wp-json/wc/v3/'
    this.url = url + restBase

    // TODO: move this
    this.authString = 'Basic Y2tfZGY3NjBlMmIxYjYxNGQ3MmEwZTliMmFkMTA5NTVhZTM3YWE5ZDUwYzpjc185ZTRhYjI2OTBjZjIxM2Q2YTk3YmYyZGFjMzI2Yjg5MjkzOTAyYTBh'
    // reactordev
    // this.authString = 'Basic Y2tfMDM4NTI0M2Y1NDZmNzhmNGE3MWZiOWNkNTZmNzM4NTkyNDhmMWQ0Yzpjc19lYWUwZDVhY2FjNjBhOGZkMmY5OGNiZTQ0ZWMyMzgyNGMzZTFiNGNm'

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

      let url = this.url + route;

      // set pagination
      if( page === 'nopaging' ) {
        // get all results with no paging
        url = url + concat + 'per_page=50'
      } else if( page ) {
        url = url + concat + 'page=' + page
      } else {
        url = url + concat + 'page=1'
      }

      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type':  'application/json',
          'Authorization': this.authString
        })
      };

      this.http.get( url, httpOptions )
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

  send( data, route ) {

    return new Promise( (resolve, reject) => {

      if( !data )
        reject({ data: { message: "No data." } })

      let url = this.url + route

      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type':  'application/json',
          'Authorization': this.authString
        })
      };

      this.http.post( url, data, httpOptions )
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

  addToCart( data ) {

    return new Promise( (resolve, reject) => {

      if( !data )
        reject({ data: { message: "No data." } })

      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type':  'application/json',
          'Authorization': this.authString
        })
      };

      this.http.post( this.url.replace('v3', 'v2') + 'cart/add', data, httpOptions )
        .subscribe(response => {

          resolve(response);
        },
        error => {
          // probably a bad url or 404
          reject(error);
          this.handleError(error)
        })

    }); // end Promise

  }

  clearCart() {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': this.authString
      })
    };

    return new Promise( (resolve, reject) => {

      this.http.post( this.url.replace('v3', 'v2') + 'cart/clear', null, httpOptions )
        .subscribe(response => {

          resolve(response);
        },
        error => {
          // probably a bad url or 404
          reject(error);
          this.handleError(error)
        })

    }); // end Promise

  }

  getCartContents() {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': this.authString
      })
    };

    return new Promise( (resolve, reject) => {

      this.http.get( this.url.replace('v3', 'v2') + 'cart?thumb=true', httpOptions )
        .subscribe(response => {

          resolve(response);
        },
        error => {
          // probably a bad url or 404
          reject(error);
          this.handleError(error)
        })

    }); // end Promise

  }

  getCartTotals() {

    return new Promise( (resolve, reject) => {

      this.http.post( this.url.replace('v3', 'v2') + 'cart/totals', null )
        .subscribe(response => {

          resolve(response);
        },
        error => {
          // probably a bad url or 404
          reject(error);
          this.handleError(error)
        })

    }); // end Promise

  }

  handleError(err) {
    console.warn(err);
  }

}