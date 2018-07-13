import {Injectable} from '@angular/core';
import {InAppBrowser, InAppBrowserObject} from '@ionic-native/in-app-browser';

/*
  Appwoo

*/
@Injectable()
export class AppWoo {

  iframe: any;
  browser: InAppBrowserObject;

  constructor(private iab: InAppBrowser) {
  }

  paypal( paypal_url, redirect ) {

    this.browser = this.iab.create( paypal_url, '_blank' );

    this.browser.on('exit').subscribe(value => {
      this.browserClose( redirect );
    });

    this.browser.on('loadstop').subscribe(event => {
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

    // find our iframe components by tag name
    let components = document.querySelectorAll('#nav wordpress-page');

    for (var i = 0; i < components.length; ++i) {

        if( !components[i].hasAttribute('hidden') ) {
          // we are just getting the last component on the page
          var active = components[i];
        }
    }

    this.iframe = active.querySelector('#ap3-iframe');

  }

}