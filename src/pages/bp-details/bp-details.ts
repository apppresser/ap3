import {NavController, NavParams, ModalController, Platform, ViewController, IonicPage} from 'ionic-angular';
import {Component, Renderer, ElementRef, OnInit} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {SocialSharing} from '@ionic-native/social-sharing';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';

import {MediaPlayer} from '../media-player/media-player';
import { VideoUtils } from "../../providers/video/video-utils";

@IonicPage()
@Component({
  templateUrl: 'bp-details.html',
  selector: 'bp-details'
})
export class BpDetailsPage implements OnInit {
  selectedItem: any;
  activityComments: any;
  content: any;
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
    public http: Http
    ) {
    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = this.navParams.get('item');

    if( !this.selectedItem )
      return;

    console.log(this.navParams)

  }

  ngOnInit() {

    this.setupContent()
    
    this.getComments()

  }

  getComments() {

    let url = this.navParams.get('route') + '/' + this.selectedItem.id

    console.log(url)

    this.http.get( url )
      .map(res => res.json())
      .subscribe(response => {

        console.log(response)

        this.activityComments = this.formatComments( response.activities[0].children );

        console.log(this.activityComments)

      },
      error => {
        // probably a bad url or 404
        this.activityItem = { content: "Error retrieving activity." }
      })

  }

  setupContent() {

    this.content = this.sanitizer.bypassSecurityTrustHtml( this.selectedItem.content );

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
 
  }

  mediaModal( src, img = null ) {

    let modal = this.modalCtrl.create(MediaPlayer, {source: src, image: img});
    modal.present();

  }

  share() {

    this.SocialSharing.share( this.selectedItem.title.rendered, null, null, this.selectedItem.link ).then(() => {
      // Sharing via email is possible
    }).catch(() => {
      // Sharing via email is not possible
    });

  }

  // changes the back button transition direction if app is RTL
  backRtlTransition() {
    let obj = {}

    if( this.platform.is('ios') )
      obj = {direction: 'forward'}
    
    this.nav.pop( obj )
  }

}
