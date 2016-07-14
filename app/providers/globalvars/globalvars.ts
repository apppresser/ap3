import {Injectable} from '@angular/core';

/*
  Store global variables to use throughout app

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class GlobalVars {

  url: string = 'http://10.0.1.12/';

  // could get this through an API to allow more control in WP
  ad_units: Object = {
    ios: {
      banner: 'ca-app-pub-8368235833602204/7696307576',
      interstitial: 'ca-app-pub-8368235833602204/4143751976'
    },
    android: {
      banner: '',
      interstitial: ''
    }
  }

  constructor() {}

  getUrl() {
    return this.url;
  }

  getAds() {
    return this.ad_units;
  }

}