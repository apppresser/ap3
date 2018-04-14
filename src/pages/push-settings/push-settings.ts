import {Component} from '@angular/core';
import {NavParams, ViewController, ToastController, IonicPage} from 'ionic-angular';
import {Storage} from '@ionic/storage';
import {PushService} from '../../providers/push/push';

@IonicPage()
@Component({
  templateUrl: 'push-settings.html',
  selector: 'push-settings'
})
export class PushSettings {

  segments: any;
  title: string;

  constructor( 
    public navParams: NavParams,
    public storage: Storage,
    public push: PushService,
    public viewCtrl: ViewController,
    public toastCtrl: ToastController
    ) {
      
      if(this.navParams.get('title')) {
        this.title = this.navParams.get('title');
      } else {
        this.title = 'Notification Settings';
      }
  }

  ionViewWillEnter() {
    this.getSegments()
  }

  // first get existing checked segments
  getSegments() {
  
    this.storage.get( 'segments' ).then( segmentList => {

      if(!segmentList) {
        // no segments, so don't have to see if they are checked
        this.segments = JSON.parse( window.localStorage.getItem('myappp') ).segments
        this.storage.set( 'segments', this.segments )
        return;
      }

      var checkedSegments = [];

      for (var i = segmentList.length - 1; i >= 0; i--) {
        if( segmentList[i].isChecked == true )
          checkedSegments.push(segmentList[i].arn)
      }

      this.setSegments(checkedSegments)

    })
    
  }

  // get new segments, making sure existing checked ones stay checked, then save
  setSegments( checkedSegments ) {

    let newSegments = JSON.parse( window.localStorage.getItem('myappp') ).segments

    for (var i = newSegments.length - 1; i >= 0; i--) {

      if( checkedSegments.indexOf(newSegments[i].arn) >= 0 ) {
        // segment is checked, resave it that way
        newSegments[i].isChecked = true
      }

    }

    this.segments = newSegments

    this.storage.set( 'segments', newSegments )

  }

  toggleSegment( event, segment, segments ) {

    console.log('toggleSegment', event)

    this.storage.get( segment.arn ).then( subscriptionArn => {

      if( subscriptionArn && segment.isChecked == false ) {
        this.unsubscribe( subscriptionArn, segment.arn )
      } else {
        this.subscribe( segment.arn )
      }

      // update storage with toggle values
      this.storage.set('segments', segments)

    })

  }

  checkStatus( topicArn ) {

    this.storage.get( topicArn ).then( res => {

      console.log('isChecked', res)

      if(res) {
        return true
      } else {
        return false
      }

    })

  }

  subscribe( topicArn ) {

    this.storage.get('deviceToken').then( token => {
      this.push.subscribeToTopic( token, topicArn ).then( res => {
        this.storage.set( topicArn, (<any>res).subscriptionArn )
        this.presentToast( (<any>res).msg )
      })
    })

  }

  unsubscribe( subscriptionArn, topicArn ) {

    // have to get subscriptionArn, then send to unsubscribe
    this.push.unsubscribe( subscriptionArn ).then( res => {
      this.storage.remove( topicArn )
      this.presentToast( (<any>res).msg )
    })

  }

  presentToast(msg) {

    let toast = this.toastCtrl.create({
      message: msg,
      duration: 5000,
      position: 'bottom'
    });

    toast.present();

  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}