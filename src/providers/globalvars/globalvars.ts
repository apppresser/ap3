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
  // url should be WP site with AP installed, dynamically changes based on build form
  // appid: string = '442';
  // apiurl: string = 'http://www.myapppresser.dev/test/'
  // endpoint: string = 'wp-json/ap3/v1/app/442';
  appid: string = '[[appp_app_id]]';
  apiurl: string = '[[myappp_url]]'
  endpoint: string = 'wp-json/ap3/v1/app/[[appp_app_id]]';
  api: string = this.apiurl + this.endpoint;

  constructor( public http: Http ) {}

  getApi() {
    return this.api;
  }

  getApiRoot() {
    return this.apiurl;
  }

  getAppId() {
    return this.appid;
  }

}