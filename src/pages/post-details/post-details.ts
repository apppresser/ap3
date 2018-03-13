import {NavController, NavParams, ModalController, Platform, ViewController, IonicPage} from 'ionic-angular';
import {Component, Renderer, ElementRef, OnInit} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {SocialSharing} from '@ionic-native/social-sharing';

import {MediaPlayer} from '../media-player/media-player';
import { VideoUtils } from "../../providers/video/video-utils";

@IonicPage()
@Component({
  templateUrl: 'post-details.html'
})
export class PostDetailsPage implements OnInit {
  selectedItem: any;
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
    private videoUtils: VideoUtils
    ) {
    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = this.navParams.get('item');

    this.content = sanitizer.bypassSecurityTrustHtml( this.selectedItem.content.rendered );

    // Listen for link clicks, open in in app browser
    this.listenFunc = renderer.listen(elementRef.nativeElement, 'click', (event) => {

      this.iabLinks( event.target )

    });

    if( platform.is('android') ) {
      this.videoUtils.killVideos(this.elementRef);
    }

    // allow vids and other HTML in template hooks
    if( this.selectedItem.appp && this.selectedItem.appp.post_detail ) {
      for ( let prop in this.selectedItem.appp.post_detail ) {
        this.selectedItem.appp.post_detail[prop] = sanitizer.bypassSecurityTrustHtml( this.selectedItem.appp.post_detail[prop] );
      }
    }

  }

  ngOnInit() {
    let myappp: any = localStorage.getItem('myappp');
    if(myappp) {
        if(typeof myappp == 'string')
            myappp = JSON.parse(myappp);
    
        if(myappp && myappp.meta && myappp.meta.share && myappp.meta.share.icon && myappp.meta.share.icon.hide)
            this.showShare = (myappp.meta.share.icon.hide) ? false : true;
    }
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
