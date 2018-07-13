import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';

import {Storage} from '@ionic/storage';
import {Events} from 'ionic-angular';
import {FBConnectAppSettings} from './fbconnect-settings';
import {Facebook} from '@ionic-native/facebook';
import { LoginService } from '../logins/login.service';
import { User } from "../../models/user.model";

/*
  Facebook Connect

  Used when the login is in an iframe

  See http://ionicframework.com/docs/v2/native/facebook/
*/
@Injectable()
export class FbConnectIframe {
  iframe: any;
  iframewin: any;
  iframedoc: any;

  constructor(
    public http: Http,
    public storage: Storage,
    public events: Events,
    private fbconnectvars: FBConnectAppSettings,
    private loginservice: LoginService,
    private Facebook: Facebook
    ) {
      
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

    this.Facebook.login( this.fbconnectvars.login_scope ).then( result => {
      // we get back an auth response here, should save it or something
      this.statusChangeCallback(result);
    });

    // return false; // so not to submit the form
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

    this.Facebook.api(
      "/me?fields=" + this.fbconnectvars.verify_me_fields(this.iframewin.apppfb.me_fields),
      null
    ).then( response => {
      this.fetchUser_Callback(response);
    });
  }

  // This function is called after a callback
  // from retreiving the user's email and fb_id
  fetchUser_Callback(response) {

    let redirect_url: string|boolean = false;
    
    if( this.iframedoc.getElementById('status') ) {
      this.iframedoc.getElementById('status').innerHTML = this.fbconnectvars.l10n.login_msg.replace('{{USERNAME}}', response.name);
    }
    // Send user info to WordPress login function
    if( typeof response.name != 'undefined' && typeof response.email != 'undefined') {

      this.fbconnectvars.set_avatar(response);

      this.wplogin( response.name, response.email ).then( (data: any) => {

        // successfully logged in
        let context = this.iframewin.location.pathname.substring(0, this.iframewin.location.pathname.lastIndexOf("/"));
        let baseURL = this.iframewin.location.protocol + '//' + this.iframewin.location.hostname + (this.iframewin.location.port ? ':' + this.iframewin.location.port : '') + context;
        let app_ver = ( this.iframewin.apppCore.ver ) ? this.iframewin.apppCore.ver : '3';

        if( data && data.redirect_url ) {
          redirect_url = this.fbconnectvars.get_redirect_url(data.redirect_url);
          if(redirect_url)
            data.login_redirect = redirect_url;
        }

        this.loginservice.setLoginStatus(new User(data));

        this.storage.set('user_login', data );
        
        // hide/show menu items in main app component
        this.events.publish('user:login', data );

        if( redirect_url === false)
          this.iframewin.location.href = baseURL + "?appp=" + app_ver;

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
    this.Facebook.getLoginStatus().then( result => {
      this.statusChangeCallback(result);
    })
  }

  /* Returns promise.
   * Usage: this.wplogin(name,email).then( response => { // do something });
   */
  wplogin( name, email ) {

    let nameStripped = name.replace(/\s+/g, '');

    let params = '?appp=3&action=appp_wp_fblogin&user_email=' + email + '&full_name=' + nameStripped + '&security=' + this.iframewin.apppfb.security;

    return new Promise(resolve => {

      this.http.post( this.iframewin.apppCore.ajaxurl + params, null )
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