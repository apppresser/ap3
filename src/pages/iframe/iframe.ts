import {NavParams, Nav, LoadingController, ModalController, Platform, ViewController} from 'ionic-angular';
import {Component, HostListener, ElementRef, OnInit, Input, NgZone} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import { Geolocation } from '@ionic-native/geolocation';
import { Device } from '@ionic-native/device';
import { Keyboard } from '@ionic-native/keyboard';
import { SocialSharing } from '@ionic-native/social-sharing';
import {Storage} from '@ionic/storage';

import {MediaPlayer} from '../media-player/media-player';
import {HeaderLogo} from "../../providers/header-logo/header-logo";

@Component({
    templateUrl: 'iframe.html'
})
export class Iframe {

    title: string;
    url: any;
    iframe: any;
    param: string;
    loading: any;
    loaded: boolean = false;
    activityModal: boolean = false;
    checkinModal: boolean = false;
    showShare: boolean = false;
    rtlBack: boolean = false;
    lang: string = '';
    shareUrl: string = '';
    header_logo_url: string;
    show_header_logo: boolean = false;

    constructor(
        public navParams: NavParams,
        public nav: Nav,
        public viewCtrl: ViewController,
        public platform: Platform,
        public loadingController: LoadingController, 
        public sanitizer: DomSanitizer,
        public modalCtrl: ModalController,
        public storage: Storage,
        public el: ElementRef,
        private headerLogoService: HeaderLogo,
        private Keyboard: Keyboard,
        private Device: Device,
        private Geolocation: Geolocation,
        private SocialSharing: SocialSharing,
        public zone: NgZone
        ) {
        
        if(navParams.data.is_home == true) {
          this.doLogo()
        }

        this.setupURL();

        let dataurl = navParams.data.url;

        // Show error message if in preview and not using https
        this.previewAlert( navParams.data.url );

    }

    setupURL() {

        if ( this.navParams.data.url.indexOf('?') >= 0 ) {
            this.param = '&appp=3';
        } else {
            this.param = '?appp=3';
        }

        this.storage.get('app_language').then( lang => {
            if( lang )
                this.lang = '&lang=' + lang
        })

        // Have to wait until we get language ^. Can't put this in promise or it breaks, not sure why
        setTimeout( () => {
            this.url = this.sanitizer.bypassSecurityTrustResourceUrl( this.navParams.data.url + this.param + this.lang );
        }, 100)

    }

    ionViewWillEnter() {

        this.title = this.navParams.get('title');

        this.showShare = false;

        this.iframeLoading();

        if( this.platform.isRTL() && this.viewCtrl.enableBack() ) {
            this.viewCtrl.showBackButton(false)
            this.rtlBack = true
        }
   
    }

    ionViewWillLeave() {
        // Hack to clear page title when going back. Otherwise page title will be from previous page
        window.postMessage( JSON.stringify({post_title:'', post_url: 'none'}), '*' )
    }

    iframeLoading() {

        // set this.loaded so cached pages don't show loading spinner
        if( this.loaded )
            return;

        this.loading = this.loadingController.create({
            showBackdrop: false,
            dismissOnPageChange: false
        });

        this.loading.present();      

        window.addEventListener('native.keyboardhide', (e) => {
            this.notifyThemeKeyboardClosed();
        });

        window.addEventListener('native.keyboardshow', (e) => {
            this.notifyThemeKeyboardOpened();
        });

        window.addEventListener('pause', (e) => {
            this.postPauseEvent();
        });

        setTimeout(() => {
            this.loading.dismiss();
        }, 8000);

        this.loaded = true;
    }

    ionSelected() {
        // fires when an active menu item is pressed again, causing a refresh

        this.loading = this.loadingController.create({
            showBackdrop: false,
            dismissOnPageChange: false
        });

        this.loading.present();

        var url = this.url
        this.url = ''

        setTimeout( () => {
            this.url = url
        }, 1)

    }

    // ng2 way of adding a listener
    @HostListener('window:message', ['$event'])

    onMessage(event) {
      this.myListeners(event)
    }

    myListeners(e) {

        // get current window so we can find active iframe
        let w = e.target;

        if( e.data === 'site_loaded' ) {
            this.loading.dismiss();
        } else if( e.data === 'reload_frame' ) {

            // need to reload frame on login
            this.iframe = (<any>w).document.getElementsByClassName('ap3-iframe')[0];
            let src = this.iframe.src;
            this.iframe.src = src;

        } else if( e.data === 'activity_modal' ) {
            this.activityModal = true;
        } else if( e.data === 'checkin_icon_show' || e.data === 'checkin_modal' /* icon */ ) {
            this.checkinModal = true;
        } else if( e.data === 'checkin_modal_show' ) {
            // doCheckinModal expects an event target, so we'll simulate one
            let _e = {
                target: this.el.nativeElement.querySelector('.ap3-iframe')
            };
            this.doCheckinModal(_e);
        } else if( e.data.indexOf('{') === 0 ) {

            // if it's a json object, parse it
            var parsed = JSON.parse( e.data );

            if( parsed.media ) {
                this.mediaModal( parsed.media, parsed.img );
            } else if ( parsed.apppkeyboardhelper ) {

                if(parsed.apppkeyboardhelper === 'close') {
                  if( this.Keyboard ) {
                    this.Keyboard.close();
                  }
                }

            } else if ( parsed.post_url && parsed.post_url != 'none' ) {
                this.shareUrl = parsed.post_url
                this.changeTitle( parsed.post_title )
                this.showShare = true
            } else if( parsed.post_url && parsed.post_url === 'none' ) {
                // part of the hack to clear page titles when going back
                this.showShare = false
                this.changeTitle( this.navParams.get('title') )
            }
        }

    }

    changeTitle( title ) {
        // zone fixes bug where title didn't update properly on device
        this.zone.run( () => {
            this.title = title
        } )
    }

    postPauseEvent() {
        this.iframe.contentWindow.postMessage('{"pause_event":{"platform":"'+this.Device.platform+'"}}', '*');
    }

    // find the first ancestor with the given class name
    findAncestor(el, cls) {
        while ((el = el.parentElement) && !el.classList.contains(cls));
        return el;
    }

    doActivityModal( event ) {

        this.findIframeBySelector( event.target );

        this.iframe.contentWindow.postMessage('activity', '*');

    }

    doCheckinModal( event ) {

        this.findIframeBySelector( event.target );

        // first message is to show modal, then we send through location
        this.iframe.contentWindow.postMessage('checkin', '*');

        // Do this when checkin button clicked
        this.Geolocation.getCurrentPosition().then((position) => {

            let latitude = position.coords.latitude;
            let longitude = position.coords.longitude;

            console.log('position', position);
            // need to postmessage this
            this.iframe.contentWindow.postMessage({ lat: latitude, long: longitude }, '*');

        });

    }

    notifyThemeKeyboardClosed() {

        this.findIframe();

        this.iframe.contentWindow.postMessage('appp_keyboard_closed', '*');

    }

    notifyThemeKeyboardOpened() {

        this.findIframe();

        this.iframe.contentWindow.postMessage('appp_keyboard_opened', '*');

    }

    mediaModal( src, img = null ) {

        let modal = this.modalCtrl.create(MediaPlayer, {source: src, image: img});
        modal.present();

    }

    // Show alert in preview if not using https
    previewAlert(url) {

        if( this.Device.platform != 'iOS' && this.Device.platform != 'Android' && url.indexOf('http://') >= 0 ) {

          alert('Cannot display http pages in browser preview. Please build app for device or use https.');

        }

    }

    // Must send in selector from a click event on the page
    findIframeBySelector( el ) {

        /* 
         Ionic stacks cached views on top of each other, which causes duplicate ids on the page. We need to find the active page in the stack, and send our post messages there. Otherwise message is sent to the wrong page.
        */

        let page = this.findAncestor( el, 'ion-page' );

        this.iframe = page.getElementsByClassName('ap3-iframe')[0];

    }

    // find the iframe without a selector
    findIframe() {

        /* 
         Ionic stacks cached views on top of each other, which causes duplicate ids on the page. We need to find the active page in the stack, and send our post messages there. Otherwise message is sent to the wrong page.
        */

        // only look in active stack
        let components = document.querySelectorAll('#nav > ng-component');

        for (let i = components.length - 1; i >= 0; i--) {

            if( !components[i].hasAttribute('hidden') ) {
              // this is the shown ng-component element
              var active = components[i];
            }
        }

        // If we have tabs views stack differently
        if( active.querySelectorAll('ion-tabs .show-tabbar').length ) {

          // tabs exist, define iframe relative to active tab
          let page = active.querySelectorAll( 'ion-tab[aria-hidden=false] .show-page' );
          this.iframe = page[0].getElementsByClassName('ap3-iframe')[0];

          return;

        }

        // if no tabs
        this.iframe = active.querySelector('#ap3-iframe');

    }

    // changes the back button transition direction if app is RTL
    backRtlTransition() {
        let obj = {}

        if( this.platform.is('ios') )
          obj = {direction: 'forward'}

        this.nav.pop( obj )
    }

    share() {

        this.SocialSharing.share( this.title, null, null, this.shareUrl ).then(() => {
          // Sharing via email is possible
        }).catch(() => {
          // Sharing via email is not possible
        });

    }

    doLogo() {
        // check if logo file exists. If so, show it
        this.headerLogoService.checkLogo().then( data => {
          this.show_header_logo = true
          this.header_logo_url = (<string>data)
        }).catch( e => {
            // no logo, do nothing
            //console.log(e)
        })
    }
}
