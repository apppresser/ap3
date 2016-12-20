import {Injectable} from '@angular/core';
import {InAppBrowser} from 'ionic-native';

/*
  Appwoo

*/
@Injectable()
export class AppWoo {

  iframe: any;
  browser: any;

  constructor() {
  }

  paypal( paypal_url, redirect ) {

    this.browser = new InAppBrowser( paypal_url, '_blank' );

    this.browser.addEventListener( 'exit', () => {
      this.browserClose( redirect );
    });

    this.browser.addEventListener( 'loadstop', (event) => {
      this.loadstopEvent( event );
    });

  }

  browserClose( redirect ) {

    // need to find iframe and change src
    this.findIframe();
    this.iframe.src = redirect;

  }

  loadstopEvent( event ) {

    // get base url
    let test_url = event.url.split('/')[2];

    this.findIframe();
    let src = this.iframe.src;
    src = src.split('/')[2];

    // If url in in-app browser is one of our own,
    if ( src == test_url ) {
      // redirect
      this.iframe.src = event.url;
      // and trigger the in-app browser to close
      this.browser.close();
    }

  }

  findIframe() {

    /* 
     Ionic stacks cached views on top of each other, which causes duplicate ids on the page. We need to find the active page in the stack, and send our post messages there. Otherwise message is sent to the wrong page.
    */

    // only look in active stack
      let components = document.querySelectorAll('#nav > ng-component');

      for (let i = components.length - 1; i >= 0; i--) {

        if( !components[i].hasAttribute('hidden') ) {
          // this is the shown ng-component element
          var active = components[i];
        }
      }

      // If we have tabs views stack differently
      if( active.querySelectorAll('ion-tabs .show-tabbar').length ) {

          // tabs exist, define iframe relative to active tab
          let page = active.querySelectorAll( 'ion-tab[aria-hidden=false] .show-page' );
          this.iframe = page[0].getElementsByClassName('ap3-iframe')[0];

          return;

      }

      // if no tabs
      this.iframe = active.querySelector('#ap3-iframe');

  }

}