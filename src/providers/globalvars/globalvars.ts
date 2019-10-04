import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import { isDevMode } from '@angular/core';

/*
  Store global variables to use throughout app

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class GlobalVars {

  data: any = null;
  useDynamicContentModule: boolean = false; // false when using our builder on remote Ionic builder?
  // url should be WP site with AP installed, dynamically changes based on build form
  appid: string = '[[appp_app_id]]';
  apiurl: string = '[[myappp_url]]'
  endpoint: string = 'wp-json/ap3/v1/app/';
  wooAuth: string = '[[woo_auth_string]]';
  api: string;

  constructor( public http: Http ) {

    if( isDevMode ) {
      this.useDynamicContentModule = true
    }
    // development API
    if( window.location && window.location.href && window.location.href.indexOf('localhost') >=0 ) {
      this.appid = '884';
      this.apiurl = 'https://myapppresser.com/demos/';
      // auth for appptest.wpengine.com
      // this.wooAuth = 'Basic Y2tfMmRhZTNmMzg0NDg2MGIxNmEyNzgwNjY0ODMzNjgwNzIyYjBiZTAzNzpjc183NDE3ZmFjYzJmMmVkNjQ1Zjc4NjBjOWNiOTE2MTBiZjVmY2Y2ZjVl';
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

  getWooAuth() {
    return this.wooAuth;
  }

}