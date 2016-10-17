import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';

import {GlobalVars} from '../globalvars/globalvars';

import {Device} from 'ionic-native';

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

  constructor( public http: Http, public globalvars: GlobalVars ) {
  }

  subscribeDevice(token) {

    this.platform = Device.device.platform;
    let apiRoot = this.globalvars.getApiRoot();
    this.api = apiRoot + 'wp-json/ap3/v1/subscribe/';
    this.appid = this.globalvars.getAppId();

    let params = '?token=' + token + '&platform=' + this.platform + '&id=' + this.appid;

    // let headers = new Headers({ 'Content-Type': 'application/json' });
    // let options = new RequestOptions({ headers: headers });

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

}