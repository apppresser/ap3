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
  sns: any;
  gcmAppArn: string;
  ApnsAppArn: string;
  snsTopicArn: string;
  apiurl: string;

  constructor( public http: Http, public globalvars: GlobalVars ) {

    this.gcmAppArn = '[[gcmAppArn]]';
    this.snsTopicArn = '[[snsTopicArn]]';
    this.ApnsAppArn = '[[ApnsAppArn]]';

  }

  snsSetup() {

    let userAccessKey = '[[userAccessKey]]';
    let userSecretKey = '[[userSecretKey]]';

    // AWS setup.  Should hard code users credentials
    AWS.config.update({accessKeyId: userAccessKey, secretAccessKey: userSecretKey });

    AWS.config.region = 'us-west-2';

    this.sns = new AWS.SNS();
    
  }

  subscribeToTopic(endpointArn) {

    console.log('subscribe to topic: ' + endpointArn );
      // auto-subscribe devices to our topic, so we can push to ios/android at the same time
      let params = {
        Protocol: 'application', /* required */
        // TopicArn should be hard coded from app creation
        TopicArn: this.snsTopicArn, /* required */
        // Get Endpoint from createPlatformEndpoint() above
        Endpoint: endpointArn
      };
      this.sns.subscribe(params, (err, data) => {
        if (err) console.log( 'Error: ' + err, err.stack); // an error occurred
        else     console.log( 'Subscribe success: ' + data);           // successful response
      });
  }

  createEndpoint( token ) {

    this.snsSetup();

    console.log( 'createEndpoint ' + token );

    if (Device.device.platform == 'android' || Device.device.platform == 'Android') {

        var params = {
            // GCM platform Arn here
          PlatformApplicationArn: this.gcmAppArn, /* required */
          Token: token, /* required */
        };

    } else {

        var params = {
            // iOS platform Arn here
          PlatformApplicationArn: this.ApnsAppArn, /* required */
          Token: token, /* required */
        };

    }

    this.sns.createPlatformEndpoint( params, (err, data) => {
      if (err) {
        console.log('sns.createPlatformEndpoint error' + err);
      } else { 
        console.log('Endpoint Arn: ' + data.EndpointArn);
        // if the endpoint is created successfully, subscribe it to our topic
        this.subscribeToTopic(data.EndpointArn);
      }
    });

  }

}