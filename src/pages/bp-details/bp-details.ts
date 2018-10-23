import {NavController, NavParams, ModalController, Platform, ViewController, IonicPage, Events, ToastController} from 'ionic-angular';
import {Component, Renderer, ElementRef, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {DomSanitizer} from '@angular/platform-browser';
import {SocialSharing} from '@ionic-native/social-sharing';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';

import {MediaPlayer} from '../media-player/media-player';
import { VideoUtils } from "../../providers/video/video-utils";
import {BpProvider} from '../../providers/buddypress/bp-provider';
import {AnalyticsService} from '../../providers/analytics/analytics.service';

@IonicPage()
@Component({
  templateUrl: 'bp-details.html',
  selector: 'bp-details'
})
export class BpDetailsPage implements OnInit {
  selectedItem: any;
  login_data: any;
  activityComments = <any>[];
  commentsLoaded: boolean = false;
  listenFunc: Function;
  rtlBack: boolean = false;
  showShare: boolean = true;

  constructor(
    public nav: NavController, 
    public navParams: NavParams, 
    public sanitizer: DomSanitizer,
    public modalCtrl: ModalController,
    public renderer: Renderer,
    public elementRef: ElementRef,
    public viewCtrl: ViewController,
    public platform: Platform,
    private SocialSharing: SocialSharing,
    private videoUtils: VideoUtils,
    public http: Http,
    public events: Events,
    public bpProvider: BpProvider,
    public toastCtrl: ToastController,
    private ga: AnalyticsService,
    public translate: TranslateService
    ) {
    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = this.navParams.get('item');

    this.login_data = this.navParams.get('login_data');

    if( !this.selectedItem )
      return;

  }

  ngOnInit() {

    this.setupContent()
  
    this.getComments()

    this.events.subscribe('bp-add-comment', data => {
      this.activityComments.push( data[0] )
    });

  }

  getComments() {

    this.bpProvider.getItem( 'activity/' + this.selectedItem.id, this.login_data ).then(response => {

        this.activityComments = this.formatComments( (<any>response).activities[0].children );

        this.commentsLoaded = true

      }).catch( e => {

        console.warn(e)
        this.commentsLoaded = true

      })

  }

  setupContent() {

    // remove listener first so we don't set it multiple times
    if( this.listenFunc ) {
      this.listenFunc()
    }

    // Listen for link clicks, open in in app browser
    this.listenFunc = this.renderer.listen(this.elementRef.nativeElement, 'click', (event) => {

      this.iabLinks( event.target )

    });

    if( this.platform.is('android') ) {
      this.videoUtils.killVideos(this.elementRef);
    }

  }

  formatComments( comments ) {

    const ret = [];

    Object.keys(comments).forEach(
      e => {
        console.log(comments[e])
        ret.push( comments[e] )
      }
    );

    return ret;
    
  }

  iabLinks( el ) {

    var target = '_blank'
      
    if( el.href && el.href.indexOf('http') >= 0 ) {

      if( el.classList && el.classList.contains('system') )
        target = '_system'

      event.preventDefault()
      window.open( el.href, target )

    } else if( el.tagName == 'IMG' && el.parentNode.href && el.parentNode.href.indexOf('http') >= 0 ) {

      // handle image tags that have link as the parent
      if( el.parentNode.classList && el.parentNode.classList.contains('system') )
        target = '_system'

      event.preventDefault()
      window.open( el.parentNode.href, target )

    }

  }

  ionViewWillEnter() {

    if( this.platform.isRTL && this.viewCtrl.enableBack() ) {
        this.viewCtrl.showBackButton(false)
        this.rtlBack = true
    }

    if(this.selectedItem.component && this.selectedItem.id) {
      this.ga.trackScreenView('BpDetailsPage', this.selectedItem.component + '/' + this.selectedItem.id);
    }
  }

  mediaModal( src, img = null ) {

    let modal = this.modalCtrl.create(MediaPlayer, {source: src, image: img});
    modal.present();

  }

  comment() {

    if( !this.navParams.get('login_data') ) {
      this.events.publish('login:force_login')
    } else {
      let modal = this.modalCtrl.create('BpModal', {comment: true, parent: this.selectedItem.id });
      modal.present();
    }
    
  }

  flag() {

    if( !this.login_data || !this.login_data.user_id ) {
      this.presentToast('You must be logged in to do that.')
    }

    this.selectedItem.flagged = true

    this.bpProvider.updateItem( 'activity_flag', this.login_data, this.selectedItem.id ).then( ret => {

      this.presentToast('Activity has been marked as flagged.')

    }).catch( e => {
      console.warn(e)
    })

  }

  share() {

    this.SocialSharing.share( this.selectedItem.title.rendered, null, null, this.selectedItem.link ).then(() => {
      // Sharing via email is possible
    }).catch(() => {
      // Sharing via email is not possible
    });

  }

  openMember( item ) {

    this.nav.push('BpProfilePage', {
      user_id: this.selectedItem.user,
      login_data: this.login_data
    });
    
  }

  // maybe add https to avatar url
  formatUrl( url ) {

    if( !url )
      return;

    if( url.indexOf('http') >= 0 ) {
      return url;
    } else {
      return 'https:' + url;
    }

  }

  presentToast(msg) {

    this.translate.get(msg).subscribe( translation => {

      let toast = this.toastCtrl.create({
        message: msg,
        duration: 3000,
        position: 'bottom'
      });

      toast.present();

    })

  }

  // changes the back button transition direction if app is RTL
  backRtlTransition() {
    let obj = {}

    if( this.platform.is('ios') )
      obj = {direction: 'forward'}
    
    this.nav.pop( obj )
  }

}