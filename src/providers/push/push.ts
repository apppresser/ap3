import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';

import {GlobalVars} from '../globalvars/globalvars';

import {Device} from '@ionic-native/device';
import {Storage} from '@ionic/storage';

declare var AWS:any;

/*
  Push Notifications

  See http://ionicframework.com/docs/v2/native/push/
*/
@Injectable()
export class PushService {

  api: string;
  platform: string;
  appid: string;
  iframe: any;

  constructor( 
    public http: Http, 
    public globalvars: GlobalVars,
    public storage: Storage,
    private Device: Device
    ) {
  }

  // Subscribe for push through our API service
  subscribeDevice(token) {

    this.platform = this.Device.platform;
    let apiRoot = this.globalvars.getApiRoot();
    this.api = apiRoot + 'wp-json/ap3/v1/subscribe/';
    this.appid = this.globalvars.getAppId();

    let params = '?token=' + token + '&platform=' + this.platform + '&id=' + this.appid;

    return new Promise(resolve => {

      this.http.post( this.api + params, null, null )
        .map(res => res.json())
        .subscribe(
          data => {
          resolve(data);
          },
          error => console.warn('subscribeDevice error' + error) 
        );
    });
  }

  // sends device id to WordPress to save as user meta, which we use later to send pushes to specific devices.
  sendDeviceToWp( id, ajaxurl ) {

    let params = '?action=ap3_add_device_id&endpoint=' + id;

    // console.log('sending device id to wp: ' + ajaxurl + params );

    return new Promise(resolve => {

      this.http.post( ajaxurl + params, null, null )
        .map(res => res.json())
        .subscribe(
          data => {
          resolve(data);
          },
          error => console.warn('sendDeviceToWp error', error) 
        );
    });


  }

  // Subscribe to a topic, for push segmenting
  subscribeToTopic(token, topicArn) {

    this.platform = this.Device.platform;
    let apiRoot = this.globalvars.getApiRoot();
    this.api = apiRoot + 'wp-json/ap3/v1/subscribe/';
    this.appid = this.globalvars.getAppId();

    let params = '?token=' + token + '&platform=' + this.platform + '&id=' + this.appid + '&topicarn=' + topicArn;

    return new Promise(resolve => {

      this.http.post( this.api + params, null, null )
        .map(res => res.json())
        .subscribe(
          data => {
            resolve( JSON.parse(data) );
          },
          error => console.warn('subscribe topic error' + error) 
        );
    });
 
  }

  // Unsubscribe. Requires subscriptionArn which is returned after subscribing to a topic.
  unsubscribe( subscriptionArn ) {

    let apiRoot = this.globalvars.getApiRoot();
    this.api = apiRoot + 'wp-json/ap3/v1/unsubscribe/';

    let params = '?subscriptionArn=' + subscriptionArn;

    return new Promise(resolve => {

      this.http.post( this.api + params, null, null )
        .map(res => res.json())
        .subscribe(
          data => {
            resolve( JSON.parse(data) );
          },
          error => console.warn('Unsubscribe error' + error) 
        );
    });

  }

}