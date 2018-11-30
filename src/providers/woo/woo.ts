import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';

@Injectable()
export class WooProvider {

  data: any = null;
  url: string;
  wooRest: string;
  cartRest: string;
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
    this.wooRest = 'wp-json/wc/v3/';
    this.cartRest = 'wp-json/appcommerce/v1/cart';

    // development API
    if( window.location && window.location.href && window.location.href.indexOf('localhost') >=0 ) {
      // test key for local environment
      this.authString = 'Basic Y2tfZGY3NjBlMmIxYjYxNGQ3MmEwZTliMmFkMTA5NTVhZTM3YWE5ZDUwYzpjc185ZTRhYjI2OTBjZjIxM2Q2YTk3YmYyZGFjMzI2Yjg5MjkzOTAyYTBh'
    } else {
      this.authString = '[[woo_auth_string]]'
    }

    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': this.authString
      }),
      withCredentials: true
    };

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

      let url = this.url + this.wooRest + route;

      // set pagination
      if( page === 'nopaging' ) {
        // get all results with no paging
        url = url + concat + 'per_page=50'
      } else if( page ) {
        url = url + concat + 'page=' + page
      } else {
        url = url + concat + 'page=1'
      }

      this.http.get( url, this.httpOptions )
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

      let url = this.url + this.wooRest + route

      this.http.post( url, data, this.httpOptions )
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

      this.http.post( this.url + this.cartRest + '/add', data, this.httpOptions )
        .subscribe(response => {

          console.log(response)

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

    return new Promise( (resolve, reject) => {

      this.http.post( this.url + this.cartRest + '/clear', null, this.httpOptions )
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

    return new Promise( (resolve, reject) => {

      this.http.get( this.url + this.cartRest + '?thumb=true', this.httpOptions )
        .subscribe(response => {

          this.setCartCount(response)

          resolve(response);
        },
        error => {
          // probably a bad url or 404
          reject(error);
          this.handleError(error)
        })

    }); // end Promise

  }

  // update cart total every time we do an API call
  setCartCount( response ) {

    if( typeof (<any>response) === 'string' ) {
      this.storage.remove( 'cart_count' )
    } else {
      this.storage.set( 'cart_count', (<any>response).cart_total.cart_contents_count )
    }

  }

  removeItem( item ) {

    return new Promise( (resolve, reject) => {

      this.http.delete( this.url + this.cartRest + '/cart-item?cart_item_key=' + item.key, this.httpOptions )
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

  updateItem( item, quantity ) {

    return new Promise( (resolve, reject) => {

      this.http.post( this.url + this.cartRest + '/cart-item?cart_item_key=' + item.key + '&quantity=' + quantity, null, this.httpOptions )
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

  // find cart, shop, etc page in menu items, return [ id, slug ]
  getWooPage( pageName ) {

    let pages = this.itemParsed.menus.items
    pages.push( this.itemParsed.tab_menu.items )
    
    for(let page of pages) {
      if( page && page.woo_page && page.woo_page == pageName ) {
        return page;
      }
    }

    return null;

  }

  getSetting() {

    return new Promise( (resolve, reject) => {

      this.http.get( this.url + this.wooRest + 'system_status', this.httpOptions )
        .subscribe(data => {

          this.data = data;

          resolve( this.data );
        },
        error => {
          // probably a bad url or 404
          reject(error);
          this.handleError(error)
        })

    }); // end Promise

  }

  getCurrencySymbol() {

    return new Promise( (resolve, reject) => {

      this.storage.get('woo_currency_symbol').then( symbol => {

        if( symbol ) {
          resolve( symbol );
        } else {

          this.getSetting().then( settings => {

            console.log('settings', settings)

            if( settings && (<any>settings).settings && (<any>settings).settings.currency_symbol ) {

              this.storage.set('woo_currency_symbol', (<any>settings).settings.currency_symbol)

              resolve( (<any>settings).settings.currency_symbol );

            } else {
              // default to USD
              resolve('&#36;')
            }

          }).catch( e => {
            console.warn(e)
            resolve('&#36;')
          }) // end getSetting()

        }

      }) // end storage.get

    }) // end promise
  }

  /* Returns promise.
   */
  getCustom( route ) {

    return new Promise( (resolve, reject) => {

      if( !route )
        reject({ data: { message: "No URL set. " } })

      let url = this.url + route;

      this.http.get( url, this.httpOptions )
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

  handleError(err) {
    console.warn(err);
  }

}