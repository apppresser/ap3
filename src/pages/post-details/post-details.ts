import {NavController, NavParams, ModalController, Platform, ViewController, IonicPage} from 'ionic-angular';
import {Component, Renderer, ElementRef, OnInit} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {SocialSharing} from '@ionic-native/social-sharing';

import {MediaPlayer} from '../media-player/media-player';
import { VideoUtils } from "../../providers/video/video-utils";
import { MenuService } from '../../providers/menus/menu.service';
import { LoginService } from '../../providers/logins/login.service';
import {AnalyticsService} from '../../providers/analytics/analytics.service';

@IonicPage()
@Component({
  templateUrl: 'post-details.html',
  selector: 'post-details'
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
    private menuservice: MenuService,
    private loginservice: LoginService,
    private ga: AnalyticsService,
    private videoUtils: VideoUtils
    ) {
    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = this.navParams.get('item');

    this.content = sanitizer.bypassSecurityTrustHtml( this.selectedItem.content.rendered );

    // Listen for link clicks, open in in app browser
    this.listenFunc = renderer.listen(elementRef.nativeElement, 'click', (event) => {

      if(!this.hasPushPageAttr(event)) {
        this.iabLinks( event.target, event )
      }


    });

    if( platform.is('android') ) {
      this.videoUtils.killVideos(this.elementRef);
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

  iabLinks( el, event? ) {

    let target = '_blank'
      
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

  /**
   * Look for push-page or open-page on the target
   * 
   * @param event click event on a link
   */
  hasPushPageAttr(event) {

    let el: HTMLElement = event.target;
    let page_slug = el.getAttribute('data-apppage');
    if(!page_slug) {
      // IMG might be wrapped
      page_slug = el.parentElement.getAttribute('data-apppage');
    }

    if( page_slug ) {
      
      let menuType = null;

      let page_index = this.menuservice.getIndexBySlug(page_slug, 'tab');

      if(page_index) {
        menuType = 'tab';
      } else {
        page_index = this.menuservice.getIndexBySlug(page_slug, 'side');

        if(page_index) {
          menuType = 'side';
        }
      }
      
      if(menuType) {

        let navParams = null;

        event.preventDefault();
        event.stopPropagation();

        if(menuType == 'tab') {
          navParams = this.menuservice.tabs[page_index];
        } else {
          navParams = this.menuservice.menu[page_index];
        }

        let nav = {
          root: this.menuservice.getPageModuleName(navParams),
          navParams: navParams,
          opt: ( this.platform.isRTL && this.platform.is('ios') ) ? { direction: 'back' } : {}
        };
      
        if(!this.loginservice.yieldLogin(nav.navParams) ) {
          this.nav.push(nav.root, nav.navParams, nav.opt);
        }

        return true;
      }
    }

    return false;
  }

  ionViewWillEnter() {

    if( this.platform.isRTL && this.viewCtrl.enableBack() ) {
        this.viewCtrl.showBackButton(false)
        this.rtlBack = true
    }

    if(this.selectedItem && this.selectedItem.link)
      this.ga.trackScreenView('PostDetailsPage', 'link/' + this.selectedItem.link);
 
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
