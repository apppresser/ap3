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
  useDynamicContentModule: boolean = true; // false when using our builder on remote Ionic builder?
  // url should be WP site with AP installed, dynamically changes based on build form
  appid: string = '[[appp_app_id]]';
  apiurl: string = '[[myappp_url]]'
  endpoint: string = 'wp-json/ap3/v1/app/';
  api: string;

  constructor( public http: Http ) {
    // development API
    if( window.location && window.location.href && window.location.href.indexOf('localhost') >=0 ) {
      this.appid = '764';
      this.apiurl = 'https://myapppresser.local/test/';
    }
    this.endpoint += this.appid;
    this.api = this.apiurl + this.endpoint
  }

  getApi() {
    return this.api;
  }

  getApiRoot() {
    return this.apiurl;
  }

  getAppId() {
    return this.appid;
  }

  getUseDynamicPageModule() {
    return this.useDynamicContentModule;
  }

}