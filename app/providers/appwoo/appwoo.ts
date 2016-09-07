import {Injectable} from '@angular/core';
import {InAppBrowser} from 'ionic-native';

/*
  Appwoo

*/
@Injectable()
export class AppWoo {

  constructor() {
  }

  paypal( paypal_url, redirect ) {

    let browser = InAppBrowser.open( paypal_url, '_blank' );

    browser.addEventListener('exit', this.browserClose( redirect ) );

  }

  browserClose( redirect ) {

    console.log( redirect );

  }

}