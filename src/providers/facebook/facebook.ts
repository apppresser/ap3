import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';

import {Facebook} from 'ionic-native';

/*
  Facebook Connect

  See http://ionicframework.com/docs/v2/native/facebook/
*/
@Injectable()
export class FbConnect {
  fbconnectvars: any;
  iframe: any;
  iframewin: any;
  iframedoc: any;

  constructor(public http: Http) {

    this.fbconnectvars = {
      debug: false,
      login_scope: [ 'email','public_profile','user_friends'],
      l10n:{
        login_msg:'Thanks for logging in, {{USERNAME}}!',
        fetch_user_fail:'Sorry, login failed',
        not_authorized:'Please log into this app.',
        fb_not_logged_in:'Please log into Facebook.',
        wp_login_error:'WordPress login error',
        login_fail:'Login error, please try again.'
      }
    }

  }

  init() {

    let debug = this.fbconnectvars.debug;

    this.findIframe();

    // (<any>) syntax is to avoid typescript errors
    this.iframedoc = this.iframe.contentWindow.document;
    this.iframewin = this.iframe.contentWindow.window;
      
    if( typeof this.iframewin.apppfb == 'undefined' ) {
      return;
    }

    if( typeof this.iframewin.apppfb.l10n !== 'undefined' ) {
      this.fbconnectvars.l10n = this.iframewin.apppfb.l10n
    }

  }

  login() {

    this.init();

    Facebook.login( this.fbconnectvars.login_scope ).then( result => {
      // we get back an auth response here, should save it or something
      this.statusChangeCallback(result);
    });

    // return false; // so not to submit the form
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

  // This is called with the results from from FB.getLoginStatus().
  statusChangeCallback(response) {

    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
      this.fbMe(response);
    } else if (response.status === 'not_authorized') {
      // The person is logged into Facebook, but not your app.
      this.iframedoc.getElementById('status').innerHTML = this.fbconnectvars.l10n.not_authorized;
    } else {
      // The person is not logged into Facebook, so we're not sure if
      // they are logged into this app or not.
      this.iframedoc.getElementById('status').innerHTML = this.fbconnectvars.l10n.fb_not_logged_in;
    }
  }

  fbMe(response) {

    Facebook.api(
      "/me?fields=" + this.iframewin.apppfb.me_fields,
      null
    ).then( response => {
      this.fetchUser_Callback(response);
    });
  }

  // This function is called after a callback
  // from retreiving the user's email and fb_id
  fetchUser_Callback(response) {
    
    if( this.iframedoc.getElementById('status') ) {
      this.iframedoc.getElementById('status').innerHTML = this.fbconnectvars.l10n.login_msg.replace('{{USERNAME}}', response.name);
    }
    // Send user info to WordPress login function
    if( typeof response.name != 'undefined' && typeof response.email != 'undefined') {
      this.wplogin( response.name, response.email ).then( data => {

        // successfully logged in
        let context = this.iframewin.location.pathname.substring(0, this.iframewin.location.pathname.lastIndexOf("/"));
        let baseURL = this.iframewin.location.protocol + '//' + this.iframewin.location.hostname + (this.iframewin.location.port ? ':' + this.iframewin.location.port : '') + context;
        let app_ver = ( this.iframewin.apppCore.ver ) ? this.iframewin.apppCore.ver : '2';

        if( data && data["redirect_url"] ) {
          let redirect_url = data["redirect_url"];
          if( redirect_url.indexOf('?') === -1 && redirect_url.indexOf('appp=') === -1 ) {
            this.iframewin.location.href = redirect_url+ "?appp=" + app_ver;
            return;
          } else if( redirect_url.indexOf('appp=') === -1 ) {
            this.iframewin.location.href = redirect_url+ "&appp=" + app_ver;
            return;
          } else {
            this.iframewin.location.href = data["redirect_url"];
            return;
          }
        }

        this.iframewin.location.href = baseURL + "?appp=" + app_ver;
        console.log(this.iframewin.location.href);
      });
    } else {
      console.log( response );
    }
  }

  // This function is called after a callback
  // from retreiving the user's email and fb_id
  fetchUser_CallbackError(response) {

    this.iframedoc.getElementById('status').innerHTML = this.fbconnectvars.l10n.fetch_user_fail;
  }

  // This function is called when someone finishes with the Login
  // Button.  See the onlogin handler attached to it in the sample
  // code below.
  checkLoginState() {
    Facebook.getLoginStatus().then( result => {
      this.statusChangeCallback(result);
    })
  }

  /* Returns promise.
   * Usage: this.wplogin(name,email).then( response => { // do something });
   */
  wplogin( name, email ) {

    let nameStripped = name.replace(/\s+/g, '');

    let params = '?appp=3&action=appp_wp_fblogin&user_email=' + email + '&full_name=' + nameStripped + '&security=' + this.iframewin.apppfb.security;

    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return new Promise(resolve => {

      this.http.post( this.iframewin.apppCore.ajaxurl + params, null, options )
        .map(res => res.json())
        .subscribe(
          data => {
          resolve(data);
          },
          error => alert(this.fbconnectvars.l10n.wp_login_error) 
        );
    });

  }

}