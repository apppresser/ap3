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

    this.browser = InAppBrowser.open( paypal_url, '_blank' );

    this.browser.addEventListener( 'exit', () => {
      this.browserClose( redirect ) 
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

    // If we have tabs views stack differently
    if( document.querySelectorAll('ion-tab.show-tab').length ) {

        // tabs exist, define iframe relative to active tab
        let page = document.querySelectorAll( 'ion-tab.show-tab ion-page' );
        this.iframe = page[0].getElementsByClassName('ap3-iframe')[0];
        return;

    }

    let pages = document.getElementsByClassName('ion-page');
    let lengths = pages.length;

    if( lengths > 1 ) {
        // find the active page, last one on page
        let index = lengths - 1;
        let lastpage = pages[index];

        this.iframe = lastpage.getElementsByClassName('ap3-iframe')[0];
    } else {
        // we don't have any cached views, so don't have to run this
        this.iframe = (<any>document.getElementById('ap3-iframe'));
    }

  }

}