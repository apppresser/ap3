import {NavParams, Nav, LoadingController, ModalController, Platform, ViewController, Loading} from 'ionic-angular';
import {Component, HostListener, ElementRef, OnInit, Input, NgZone} from '@angular/core';
import { HttpParams } from '@angular/common/http';
import {DomSanitizer} from '@angular/platform-browser';
import { Geolocation } from '@ionic-native/geolocation';
import { Device } from '@ionic-native/device';
import { Keyboard } from '@ionic-native/keyboard';
import { SocialSharing } from '@ionic-native/social-sharing';
import {Storage} from '@ionic/storage';
import {Events} from 'ionic-angular';

import {MediaPlayer} from '../media-player/media-player';
import {HeaderLogo} from "../../providers/header-logo/header-logo";
import { LanguageService } from "../../providers/language/language.service";
import { AnalyticsService } from '../../providers/analytics/analytics.service';

@Component({
    templateUrl: 'iframe.html',
    selector: 'wordpress-page'
})
export class Iframe implements OnInit {

    title: string = ' ';
    wp_title: string;
    url: any;
    iframe: any;
    param: string;
    loading: Loading;
    loaded: boolean = false;
    activityModal: boolean = false;
    checkinModal: boolean = false;
    showShare: boolean = false;
    rtlBack: boolean = false;
    lang: string = '';
    shareUrl: string = '';
    cart_link: string = '';
    showCartLink: boolean = false;
    header_logo_url: string;
    show_header_logo: boolean = false;
    hide_share_icon: boolean = false;
    is_registration_page: boolean = false;
    is_cached: boolean = false;

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
        private languageservice: LanguageService,
        private Keyboard: Keyboard,
        private Device: Device,
        private Geolocation: Geolocation,
        private SocialSharing: SocialSharing,
        private events: Events,
        private ga: AnalyticsService,
        public zone: NgZone
        ) {

            events.subscribe('user:login', data => {
                // reload the iframe for a logged in user
                this.setupURL();
            });
        
            events.subscribe('user:logout', data => {
                // reload the iframe for a logged out user
                this.setupURL();
            });
        }

    ngOnInit() {

        this.iframeLoading();

        if(this.navParams.data.is_home == true) {

            this.doLogo()

            // hack to fix spinner appearing too long when iframe is home tab. Caused by language service calls to resetTabs in main component.
            setTimeout(() => {
                if( this.loading )
                    this.loading.dismiss().then(() => {
                        this.loading = null;
                    })
            }, 4000);

        }

        this.setupURL();

        let dataurl = this.navParams.data.url;

        // Show error message if in preview and not using https
        this.previewAlert( this.navParams.data.url );

        let myappp: any = localStorage.getItem('myappp');
        if(myappp) {
          if(typeof myappp == 'string')
              myappp = JSON.parse(myappp);

          if(myappp && myappp.meta && myappp.meta.share && myappp.meta.share.icon && myappp.meta.share.icon.hide)
              this.hide_share_icon = myappp.meta.share.icon.hide;
        }

    }

    /**
     * Adds the appp=3 to the URL, but makes sure hashtags stay at the end 
     * and we don't end up with more than one ?.
     */
    setupURL() {
        let url = this.navParams.data.url;
        url = this.languageservice.appendUrlLang(url);
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl( url );
    }

    ionViewWillEnter() {

        // If we have already set the title from WordPress don't use the one from the menu
        if(this.title != this.wp_title) {
            this.title = this.navParams.get('title');
        }
        
        this.showShare = false;

        if(this.navParams.get('is_register_page') === true) {
            if(this.viewCtrl.enableBack())
                this.viewCtrl.showBackButton(false)
            this.rtlBack = false
            this.is_registration_page = true;
        } else if( this.platform.isRTL && this.viewCtrl.enableBack() ) {
            this.viewCtrl.showBackButton(false)
            this.rtlBack = true
            this.is_registration_page = false;
        }

        if(this.navParams.data.url) {
            this.ga.trackScreenView('Iframe', this.navParams.data.url);
		}
    }

    ionViewDidLoad() {

        // set this.iframe for use in cached views
        this.findIframe()

    }

    ionViewDidEnter() {

        // this message fires when entering a cached view so we can update any data with ajax. For example, learndash course progress
        if( this.iframe && this.is_cached ) {
            this.iframe.contentWindow.postMessage('app_view_enter', '*');
        }

    }

    ionViewWillLeave() {
        // Hack to clear page title when going back. Otherwise page title will be from previous page
        window.postMessage( JSON.stringify({post_title:'', post_url: 'none'}), '*' )

        this.is_cached = true;

    }

    iframeLoading() {

        // set this.loaded so cached pages don't show loading spinner
        if( this.loaded )
            return;

        this.showSpinner()

        window.addEventListener('native.keyboardhide', (e) => {
            this.notifyThemeKeyboardClosed();
        });

        window.addEventListener('native.keyboardshow', (e) => {
            this.notifyThemeKeyboardOpened();
        });

        this.platform.pause.subscribe(() => {
            this.postPauseEvent();
        });

        this.loaded = true;
    }

    showSpinner() {

        // create only one spinner
        if(typeof this.loading == 'undefined' || this.loaded === null) {
            this.loading = this.loadingController.create({
                showBackdrop: false,
                dismissOnPageChange: false
            });

            this.loading.present().then(data => {
                setTimeout(() => {
                    if( this.loading )
                     this.loading.dismiss().then(() => {
                         this.loading = null;
                     })
                }, 8000);
            });
        }
    }

    ionSelected() {
        // fires when an active menu item is pressed again, causing a refresh

        this.showSpinner()

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

            if(this.loading)
                this.loading.dismiss().then(() => {
                    this.loading = null;
                });

        } else if( e.data === 'show_spinner' ) {
            this.showSpinner()
        } else if( e.data === 'open_login_modal' ) {
            this.openLoginModal()
        } else if( e.data === 'reload_frame' ) {

            // need to reload frame on login
            this.iframe = (<any>w).document.getElementsByClassName('ap3-iframe')[0];
            let src = this.iframe.src;
            this.iframe.src = src;

        } else if( e.data === 'checkin_icon_show' || e.data === 'checkin_modal' /* icon */ ) {
            this.checkinModal = true;
        } else if( e.data === 'checkin_modal_show' ) {
            // doCheckinModal expects an event target, so we'll simulate one
            let _e = {
                target: this.el.nativeElement.querySelector('.ap3-iframe')
            };
            this.doCheckinModal(_e);
        } else if( e.data === 'activity_modal' ) {
            this.zone.run( () => {
                this.activityModal = true;
            } );
        } else if( e.data === 'goback' ) {
            this.goBack();
        } else if( e.data.indexOf('{') === 0 ) {

            // if it's a json object, parse it
            var parsed = JSON.parse( e.data );

            if( parsed.media ) {
                this.mediaModal( parsed.media, parsed.img );
            } else if ( parsed.activity_modal ) {

                // console.log('parsed.iframe_url', parsed.iframe_url);
                // console.log('this.iframe.src', this.iframe.src);
                // console.log('this.navParams.data', this.navParams.data);

                // only add the activity_modal icon to this iframe
                if( ( typeof(this.navParams.data.extra_classes) !== 'undefined' && this.navParams.data.extra_classes.indexOf('bp-activity-icon') >= 0 ) || // show if has extra_class of bp-activity-icon
                    this.iframe.src.indexOf(parsed.iframe_url) == 0 || // show even if one of the URL is missing lang=en
                    this.iframe.src.indexOf('/me?') > 0 || // always show if me page
                    this.iframe.src.indexOf('/me/') > 0 || // always show if me page
                    this.iframe.src == parsed.iframe_url // show if the current iframe sent the message, but don't affect other iframes that are in the stack
                ) {
                    if( typeof(this.navParams.data.extra_classes) !== 'undefined' && this.navParams.data.extra_classes.indexOf('no-bp-activity-icon') >= 0 ) {
                        this.zone.run( () => {
                            this.activityModal = false;
                        } );
                    } else {
                        this.zone.run( () => {
                            this.activityModal = true;
                        } );
                    }
                }
            } else if ( parsed.apppkeyboardhelper ) {

                if(parsed.apppkeyboardhelper === 'close') {
                  if( this.Keyboard ) {
                    this.Keyboard.hide();
                  }
                }

            } else if ( parsed.cart_link && parsed.cart_link != '' ) {
                this.cart_link = parsed.cart_link
                this.changeTitle( parsed.post_title )
                this.showCartLink = true
            } else if ( parsed.post_url && parsed.post_url != 'none' ) {
                this.shareUrl = parsed.post_url
                this.changeTitle( parsed.post_title )
                if(!this.hide_share_icon)
                this.showShare = true
            } else if( parsed.post_url && parsed.post_url === 'none' ) {
                // part of the hack to clear page titles when going back
                this.showShare = false
                this.changeTitle( this.navParams.get('title') )
            } else if( parsed.geo_place ) {
                // doCheckinPlaceModal expects an event target, so we'll simulate one
                let _e = {
                    target: this.el.nativeElement.querySelector('.ap3-iframe')
                };
                this.doCheckinPlaceModal(_e, parsed.geo_place);
            } else if( parsed.apppgeolocation ) {
                // appp-geolocation shortcode
                let _e = {
                    target: this.el.nativeElement.querySelector('.ap3-iframe')
                };
                this.doApppGeolocation(_e);
            }
        }

    }

    changeTitle( title ) {
        if( title === '' )
            return;

        // Don't change the title if we already of the one from WordPress
        // Oops! This caused a bug: https://trello.com/c/RvRor5KD
        // if(this.wp_title)
        //     return;

        // zone fixes bug where title didn't update properly on device
        this.zone.run( () => {
            this.title = title
            this.wp_title = title
        } )
    }

    postPauseEvent() {

        this.findIframe();

        if(this.iframe && this.iframe.contentWindow) {
            this.iframe.contentWindow.postMessage('{"pause_event":{"platform":"'+this.Device.platform+'"}}', '*');
        } else {
            console.warn('contentWindow not found in iframe.ts postPauseEvent()');
        }

    }

    // find the first ancestor with the given class name
    findAncestor(el, cls) {
        while ((el = el.parentElement) && !el.classList.contains(cls));
        return el;
    }

    doActivityModal( event ) {

        this.findIframeBySelector( event.target );

        if(this.iframe && this.iframe.contentWindow) {
            this.iframe.contentWindow.postMessage('activity', '*');
        } else {
            console.warn('contentWindow not found in iframe.ts doActivityModal()');
        }

    }

    doCheckinModal( event ) {

        this.findIframeBySelector( event.target );

        // first message is to show modal, then we send through location
        if(this.iframe && this.iframe.contentWindow) {
            this.iframe.contentWindow.postMessage('checkin', '*');
        } else {
            console.warn('contentWindow not found in iframe.ts doCheckinModal()');
        }

        // Do this when checkin button clicked
        this.Geolocation.getCurrentPosition().then((position) => {

            let latitude = position.coords.latitude;
            let longitude = position.coords.longitude;

            console.log('position', position);
            // need to postmessage this
            this.iframe.contentWindow.postMessage({ lat: latitude, long: longitude }, '*');

        });

    }

    doCheckinPlaceModal( event, place ) {

        this.findIframeBySelector( event.target );

        // Do this when checkin button clicked when it has a place parameter
        this.Geolocation.getCurrentPosition().then((position) => {

            let latitude = position.coords.latitude;
            let longitude = position.coords.longitude;

            console.log('position', position);
            // need to postmessage this
            this.iframe.contentWindow.postMessage({ geo_place: place, lat: latitude, long: longitude }, '*');

        });

    }

    /**
     *  [appp-geolocation] Geo the location to set the form values
     */
    doApppGeolocation(event) {
        this.findIframeBySelector( event.target );

        // event on wp's page load containing the shortcode
        this.Geolocation.getCurrentPosition().then((position) => {

            console.log('Iframe doApppGeolocation position', position);

            let coords = {
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude,
                altitudeAccuracy: position.coords.altitudeAccuracy,
                heading: position.coords.heading,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                speed: position.coords.speed
            };
            
            let message = JSON.stringify({
                apppgeolocation: {
                    coords: coords,
                    timestamp: position.timestamp
                }
            });

            // need to postmessage this
            this.iframe.contentWindow.postMessage(message, '*');

        }).catch(reason => {
            console.log('getCurrentPosition reason', reason);

            let message = JSON.stringify({
                apppgeolocation: {
                    ready: false,
                    message: reason.message
                }
            });

            // need to postmessage this
            this.iframe.contentWindow.postMessage(message, '*');
        })
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

        let modal = this.modalCtrl.create('MediaPlayer', {source: src, image: img});
        modal.present();

    }

    openLoginModal() {

        let modal = this.modalCtrl.create( 'LoginModal');
        modal.present();

    }

    // Show alert in preview if not using https
    previewAlert(url) {

        if( this.Device.platform != 'iOS' && this.Device.platform != 'Android' && url.indexOf('http://') >= 0 && location.port != '8100' ) {

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
        let components = document.querySelectorAll('#nav wordpress-page');

        for (var i = 0; i < components.length; ++i) {

            if( !components[i].hasAttribute('hidden') ) {
              // we are just getting the last component on the page
              var active = components[i];
            }
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

        if(this.is_registration_page)
            this.events.publish('login:force_login');
    }

    share() {

        this.SocialSharing.share( this.title, null, null, this.shareUrl ).then(() => {
          // Sharing via email is possible
        }).catch(() => {
          // Sharing via email is not possible
        });

    }

    cartLink() {
        this.nav.push(Iframe, { 'title': '', 'url': this.cart_link } );
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

    // used by postMessage in applms to dismiss current view
    goBack() {
        this.findIframe();

        let page = this.findAncestor( this.iframe, 'ion-page' );

        let back = page.getElementsByClassName('back-button')[0]

        back.click()
        return;

    }
}
