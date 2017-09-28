import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
import { FBConnect_App_Settings } from './fbconnect-settings';
import { Facebook } from '@ionic-native/facebook';
import {Device} from '@ionic-native/device';
import {TranslateService} from '@ngx-translate/core';

/*
  Facebook Connect

  Used when the login is directly in the app

  See http://ionicframework.com/docs/v2/native/facebook/
*/
@Injectable()
export class FbConnect_App {
  iframe: any;
  iframewin: any;
  iframedoc: any;

  constructor(
    public http: Http,
    public storage: Storage,
    public events: Events,
    private fbconnectvars: FBConnect_App_Settings,
    private Facebook: Facebook,
    private Device: Device,
    public translate: TranslateService,
  ) {}

  login() {

    console.log('this.fbconnectvars.login_scope', this.fbconnectvars.login_scope);

    if( typeof this.Device.platform != 'string' && location.port != '8100') {
      
      this.translate.get('Please try from a device.').subscribe( text => {
        alert(text);
      });

      return;

    }

    this.Facebook.login(this.fbconnectvars.login_scope).then(result => {
      // we get back an auth response here, should save it or something
      this.statusChangeCallback(result);
    });
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
      // @TODO - Handle not authorized message
      console.log(this.fbconnectvars.l10n.not_authorized);
    } else {
      // The person is not logged into Facebook, so we're not sure if
      // they are logged into this app or not.

      // @TODO - Handle not loggedin message
      console.log(this.fbconnectvars.l10n.fb_not_logged_in);
    }
  }

  fbMe(response) {

    this.Facebook.api(
      "/me?fields=" + this.fbconnectvars.me_fields,
      null
    ).then(response => {
      this.fetchUser_Callback(response);
    });
  }

  fetchUser_Callback(response) {

    // Send user info to WordPress login function
    if (typeof response.name != 'undefined' && typeof response.email != 'undefined') {

      let login_msg = this.fbconnectvars.l10n.login_msg.replace('{{USERNAME}}', response.name);
      let redirect_url: string|boolean;

      this.fbconnectvars.set_avatar(response);

      this.events.publish('fb:login', response);
      
      this.wplogin(response.name, response.email).then( (data: any) => {

        console.log('After Facebook and WPLogin, wplogin response', data);

        // successfully logged in
        if( data && data.redirect_url ) {
          redirect_url = this.fbconnectvars.get_redirect_url(data.redirect_url); // add ?appp=3 or &appp=3
          if(redirect_url) {
            data.login_redirect = redirect_url;
          }
        }

        this.storage.set('user_login', data);

        // hide/show menu items in main app component
        this.events.publish('user:login', data);

      });
    } else {
      console.log(response);
    }
  }

  wplogin(name, email) {

    let nameStripped = name.replace(/\s+/g, '');

    let fb_security: string = this.fbconnectvars.get_nonce();
    let ajaxurl: string = this.fbconnectvars.get_ajaxurl();
    
    let params = '?appp=3&action=appp_wp_fblogin&user_email=' + email + '&full_name=' + nameStripped + '&security=' + fb_security;

    return new Promise(resolve => {

        this.http.post(ajaxurl + params, null).map(
          res => res.json()
        ).subscribe(
          data => {
            resolve(data);
          },
          error => alert(this.fbconnectvars.l10n.wp_login_error)
          );
        });
  }
}