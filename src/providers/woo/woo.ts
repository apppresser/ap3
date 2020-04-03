import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';
import { GlobalVars } from '../globalvars/globalvars';

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
    private globalvars: GlobalVars,
    public storage: Storage ) {

    let item = window.localStorage.getItem( 'myappp' );
    this.itemParsed = JSON.parse( item );
    this.url = this.itemParsed.wordpress_url;
    this.wooRest = 'wp-json/wc/v3/';
    this.cartRest = 'wp-json/appcommerce/v1/cart';
    this.authString = this.globalvars.getWooAuth();
    

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

      // don't show draft products
      if( route.indexOf('products') >= 0 && route.indexOf('reviews') < 0 ) {
        url = url + '&status=publish'
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

  /**
   * Adds item to cart
   * @param {*} data
   * @returns {Promise<any>}
   */
  public async addToCart(data: any): Promise<any> {
    if (!data) {
      throw { data: { message: "No data." } };
    }

    try {
      const login_data: any = await this.storage.get('user_login');
      const authUrlParams: string = (login_data) ? '?appp=3&token=' + login_data.access_token : '';
      return this.http.post(this.url + this.cartRest + '/add' + authUrlParams, data, this.httpOptions).toPromise();
    } catch (error) {
      // probably a bad url or 404
      this.handleError(error)
    }
  }

  /**
   * Removes all items from cart
   * @returns {Promise<any>}
   */
  public async clearCart(): Promise<any> {
    try {
      const login_data: any = await this.storage.get('user_login');
      const authUrlParams: string = (login_data) ? '?appp=3&token=' + login_data.access_token : '';
      return this.http.delete( this.url + this.cartRest + '/clear' + authUrlParams, this.httpOptions ).toPromise();
    } catch (error) {
      // probably a bad url or 404
      this.handleError(error)
    }
  }

  /**
   * Gets the cart content
   * @returns {Promise<any>}
   */
  public async getCartContents(): Promise<any> {
    try {
      const login_data: any = await this.storage.get('user_login');
      const authUrlParams: string = (login_data) ? '&appp=3&token=' + login_data.access_token : '';
      const response: any = await this.http.get(this.url + this.cartRest + '?thumb=true' + authUrlParams, this.httpOptions).toPromise();
      this.setCartCount(response);
      return response;
    } catch (error) {
      // probably a bad url or 404
      this.handleError(error)
    }
  }

  /**
   * Updates cart total every time we do an API call
   * @param {*} response
   */
  public setCartCount(response: any): void {
    if (typeof (<any>response) === 'string') {
      this.storage.remove('cart_count')
    } else {
      this.storage.set('cart_count', (<any>response).cart_total.cart_contents_count)
    }
  }

  /**
   * Removes the item from the cart
   * @param {*} item
   * @returns {Promise<any>}
   */
  public async removeItem(item: any): Promise<any> {
    try {
      const login_data: any = await this.storage.get('user_login');
      const authUrlParams: string = (login_data) ? '&appp=3&token=' + login_data.access_token : '';
      return this.http.delete(this.url + this.cartRest + '/cart-item?cart_item_key=' + item.key + authUrlParams, this.httpOptions).toPromise();
    } catch (error) {
      // probably a bad url or 404
      this.handleError(error)
    }
  }

  /**
   * Updates an item quantity on the cart
   * @param {*} item
   * @param {number} quantity
   * @returns {Promise<any>}
   */
  public async updateItem(item: any, quantity: number): Promise<any> {
    try {
      const login_data: any = await this.storage.get('user_login');
      const authUrlParams: string = (login_data) ? '&appp=3&token=' + login_data.access_token : '';
      return this.http.post( this.url + this.cartRest + '/cart-item?cart_item_key=' + item.key + '&quantity=' + quantity + authUrlParams, null, this.httpOptions ).toPromise();
    } catch (error) {
      // probably a bad url or 404
      this.handleError(error)
    }
  }

  // find cart, shop, etc page in menu items, return [ id, slug ]
  getWooPage( pageName ) {

    let pages = []

    if( this.itemParsed.menus.items ) {
      pages = this.itemParsed.menus.items
    }

    if( this.itemParsed.tab_menu.items ) {
      for (var i = 0; i < this.itemParsed.tab_menu.items.length; ++i) {
        pages.push( this.itemParsed.tab_menu.items[i] )
      }
    }
    
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