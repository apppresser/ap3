import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';

import {Push, Device, Dialogs} from 'ionic-native';

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

  constructor() {

    this.gcmAppArn = '[[gcmAppArn]]';
    this.snsTopicArn = '[[snsTopicArn]]';
    this.ApnsAppArn = '[[ApnsAppArn]]';

  }

  register() {

    let push = Push.init({
        android: {
            senderID: "[[gcm_sender]]"
        },
        ios: {
            alert: "true",
            badge: true,
            clearBadge: true,
            sound: 'false'
        },
        windows: {}
    });

    push.on('registration', (data) => {
        console.log(data.registrationId);
        this.createEndpoint(data.registrationId);
    });

    push.on('notification', (data) => {
        console.log(data);

        Dialogs.alert(
            data.message,  // message
            data.title,            // title
            'Done'                // buttonName
        );

    });

    push.on('error', (e) => {
        console.log(e.message);
    });

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

        let params = {
            // GCM platform Arn here
          PlatformApplicationArn: this.gcmAppArn, /* required */
          Token: token, /* required */
        };

    } else {

        let params = {
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