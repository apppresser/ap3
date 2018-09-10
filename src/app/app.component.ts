/* Framework */
import {ViewChild, Component, isDevMode, NgZone} from '@angular/core';
import {Platform, MenuController, Nav, ToastController, ModalController, Events, Config, LoadingController, Tab, Tabs} from 'ionic-angular';
import {DomSanitizer} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';
import {Http} from '@angular/http';

/* Providers (make sure to add to app.module.ts providers too) */
import {AppCamera} from '../providers/camera/app-camera';
import {GlobalVars} from '../providers/globalvars/globalvars';
import {AppAds} from '../providers/appads/appads';
import {FBConnectAppSettings} from '../providers/facebook/fbconnect-settings';
import {FbConnectIframe} from '../providers/facebook/login-iframe';
import {PushService} from '../providers/push/push';
import {AppWoo} from '../providers/appwoo/appwoo';
import {AppData} from '../providers/appdata/appdata';
import {AppGeo} from '../providers/appgeo/appgeo';
import {Logins} from '../providers/logins/logins';
import {Download} from '../providers/download/download';

/* Native */
import { StatusBar } from '@ionic-native/status-bar';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Device } from '@ionic-native/device';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { Dialogs } from '@ionic-native/dialogs';
import { Network } from '@ionic-native/network';
import { Keyboard } from '@ionic-native/keyboard';
import {Storage} from '@ionic/storage';
import { User } from '../models/user.model';
import { LoginService } from '../providers/logins/login.service';
import { LanguageService } from "../providers/language/language.service";
import { MenuService } from "../providers/menus/menu.service";

import {Iframe} from "../pages/iframe/iframe";
import { Language } from '../models/language.model';
import { DocumentDirection } from 'ionic-angular/umd/platform/platform';

/**
 * Customizable options for our
 * segments, media, language and login modals
 */
class ModalOptions {
	public cssClass?: string;
	public title?: string;
}

@Component({
  templateUrl: 'app.html'
})

export class MyApp {
  @ViewChild(Nav) nav: Nav;

  pages: any;
  styles: any;
  bodyTag: any;
  apiurl: string;
  login: boolean;
  navparams: any = [];
  tabs: any;
  originalTabs: any;
  login_data: any;
  user: User;
  showmenu: boolean = false;
  apptitle: string;
  introshown: any;
  networkState: any;
  bothMenus: boolean = false;
  myLoginModal: any;
  myLoginModal_open = false;
  showLogin: boolean = false;
  menu_side: string = "left";
  rtl: boolean = false;
  ajax_url: string;
  regId: any;
  customClasses: string;
  iphoneX: boolean = false;
  showingIntro: boolean = false;
  doingNotification: boolean = false;

  constructor(
    private platform: Platform,
    public appCamera: AppCamera,
    private menu: MenuController,
    private globalvars: GlobalVars,
    private appads: AppAds,
    private appgeo: AppGeo,
    private fbconnectvars: FBConnectAppSettings,
    private fbconnectIframe: FbConnectIframe,
    private loginservice: LoginService,
    private languageservice: LanguageService,
    private sanitizer: DomSanitizer,
    private pushService: PushService,
    private appwoo: AppWoo,
    private appdata: AppData,
    private logins: Logins,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public modalCtrl: ModalController,
    public events: Events,
    public translate: TranslateService,
    private Keyboard: Keyboard,
    private SplashScreen: SplashScreen,
    private StatusBar: StatusBar,
    private Network: Network,
    private SocialSharing: SocialSharing,
    private Device: Device,
    private Push: Push,
    private http: Http,
    private Dialogs: Dialogs,
    private zone: NgZone,
    private config: Config,
    private menuservice: MenuService,
    private download: Download
  ) {

    this.initializeApp();

    events.subscribe('user:login', data => {
      this.userLogin(data);
    });

    events.subscribe('user:logout', data => {
      this.userLogout(data);
    });

    events.subscribe('data:update', obj => {
      this.fetchData( obj );
    });

    events.subscribe('login:force_login', () => {
      this.openLoginModal();
    });

    events.subscribe('pushpage', page => {
      this.pushPage( page );
    });

  }

  initializeApp() {

    // Login status
    this.bodyTag = document.getElementsByTagName('body')[0];
    this.loginservice.loginStatus().subscribe(user => {
      this.user = user
      if(user) {
        this.bodyTag.classList.add('loggedin')
      } else {
        this.bodyTag.classList.remove('loggedin')
      }
    });

    // TODO: this causes a bug when iframe page is the homepage. It calls resetTabs too many times, which loads iframe.ts twice, causing the spinner to appear for too long.
    this.languageservice.languageStatus().subscribe((language: Language) => {

      let is_loggedin = (this.loginservice.user);
      this.rtl = (language.dir && language.dir == 'rtl');
      let dir: DocumentDirection = (this.rtl) ? 'rtl' : 'ltr';

      this.platform.setDir(dir, true);
      this.platform.setLang(language.code, true);

      const lang_updated = true;

      this.resetTabs(is_loggedin, lang_updated);
    });
    // Let's not wait for the data if it's already in local storge
    this.languageservice.initStoredLanguage();

    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.

      this.apiurl = this.globalvars.getApi();
      
      this.fetchData( false );

      this.doConnectionEvents();

      this.attachListeners();
      
      this.maybeDoPush();

      this.doIphoneX();

      // prevents bug where select done button didn't display
      this.Keyboard.hideKeyboardAccessoryBar(false);
      // Disable scroll fixes webview displacement, but hides content lower on page. Can't use
      //Keyboard.disableScroll(true);

      // check for API updates on resume and on initial load
      this.platform.resume.subscribe(() => {

          this.appdata.checkForUpdates( this.apiurl );
      });

      setTimeout( () => {
        this.appdata.checkForUpdates( this.apiurl );
      }, 5000 );

      // for pdf viewer in media modal
      (<any>window).pdfWorkerSrc = 'assets/lib/pdf-worker.min.js';

    });

  }

  fetchData( reset ) {

    // if refreshing the app, have to reset variables first
    if( reset ) {
      this.tabs = [];
      this.pages = null;
      this.bothMenus = false;
      this.navparams = [];
      this.showmenu = false;
    }

    // get our app data, then use it. will return either local data, or get from api
    this.appdata.load(this.apiurl).then( (data: any) => {

      console.log('Got data', data);

      this.afterData(data);

    }).catch( e => {

      // if there's a problem, default to app-data.json
      console.log( 'problem getting appdata, getting local json file', e );

      this.appdata.getData( 'app-data.json' ).then( (data:any) => {
        console.log('Got local data file.');

        this.afterData(data);

      });

    });
  }

  afterData(data) {

    this.SplashScreen.hide();
    this.loadMenu(data);

    this.showLogin = ( data.side_menu_login == "on" ) ? true : false;
    this.logins.set_force_login( (data.side_menu_force_login == "on") );

    this.menu_side = ( data.meta.menu_right == true ) ? "right" : "left";

    this.rtl = ( data.meta.rtl == true ) ? true : false;
    
    if( this.rtl === true && this.languageservice.hasStoredLanguage === false )
      this.platform.setDir('rtl', true)
    
    this.verifyLanguageFile(data);
    this.loadStyles(data);
    
    this.doStatusBar(data);
    this.getSetLang(data);
    this.getSetLogin();

    this.apptitle = data.title;

    this.storage.get( 'purchased_ad_removal' ).then( res => {

      if( !res ) {
        this.maybeDoAds(data);
      }

    })

    if( data.show_registration_link === 'on' ) {
      this.storage.set( 'api_register_setting', { "registration": true, "url": data.registration_url } );
    }

  }

  loadMenu(data) {

    // console.log('loadmenu', data);
    // any menu imported from WP has to use same component. Other pages can be added manually with different components

    // If we have a tab menu, set that up
    if( data.tab_menu.items ) {

      // Add pages manually here, can use different components like this... (then use the slug name to create your page, etc. www/build/custom.html)
      // let e = { 'title': "Downloads", 'type': 'apppages', 'page_type' : 'media-list', 'class': "information-circle", 'slug': 'custom', 'extra_classes': '', 'allow_downloads': '', 'list_route': 'http://appdev.local/wp-json/wp/v2/posts' };

      // data.tab_menu.items.push( e );

      for( let item of data.tab_menu.items ) {

        // set component, default is Iframe
        var root:any = Iframe;

        root = this.getPageType( item );

        // hide the tab if user added class of hide
        item.show = true;
        if( item.extra_classes.indexOf('hide') >= 0 || item.extra_classes.indexOf('loggedin') >= 0 ) {
          item.show = false;
        }

        this.navParamsPush(item, root);

      }

      this.tabs = this.navparams;
      this.menuservice.tabs = this.tabs.slice();
      if(typeof this.originalTabs === 'undefined')
        this.originalTabs = this.tabs.slice(); // make a copy

      this.nav.setRoot('TabsPage', this.tabs);

    }

    if( data.menus.items ) {

      this.pages = data.menus.items;
      this.menuservice.menu = this.pages.slice();

      this.showmenu = true;

      // Add pages manually here, can use different components like this... (then use the slug name to create your page, etc. www/build/custom.html)
      // let e = { 'title': "Custom Page", 'component': CustomPage, 'class': "information-circle", 'navparams': { slug: 'custom' }, extra_classes: '' };

      // this.pages.push( e );

      // set the home page to the proper component
      if( this.tabs ) {

        this.pages.unshift( { 'title': data.tab_menu.name, 'url': '', 'component': 'TabsPage', 'navparams': this.navparams, 'class': 'home', 'extra_classes':'hide', 'is_home': true } );
      } else if( !this.tabs && data.menus.items[0].type === 'apppages' ) {

        // used for custom logo
        data.menus.items[0].is_home = true;

        let root = this.getPageType( data.menus.items[0] );

        this.nav.setRoot( root, data.menus.items[0] );

      } else {

        // used for custom logo
        data.menus.items[0].is_home = true;

        // anything else uses Iframe component
        this.nav.setRoot( Iframe, data.menus.items[0] );

      }

    }

    // Only show the intro if there's a slug
    if( data.meta.intro_slug && data.meta.intro_slug != '' )
      this.maybeShowIntro( data.meta.intro_slug );

    if( data.tab_menu.items && data.menus.items ) {
      // we have both menus, use pushPage on sidemenu
      this.bothMenus = true;
    }

  }

  // construct tab items
  navParamsPush( item, root ) {

    let page: object;

    this.navparams.push( { 
      'title': item.title,
      'url': item.url, 
      'root': root,
      'icon': item.class,
      'slug': item.slug,
      'api_route' : item.api_route,
      'list_route': item.list_route,
      'list_display': item.list_display,
      'favorites': item.favorites,
      'allow_downloads': item.allow_downloads,
      'extra_classes': item.extra_classes,
      'show' : item.show,
      'show_slider': item.show_slider,
      'slide_route': item.slide_route,
      'type': item.type,
      'page_type': item.page_type,
      'page_id': item.page_id,
      'is_home': true,
      'download_list_image': item.download_list_image,
      'download_left_icon': item.download_left_icon,
      'download_right_icon': item.download_right_icon
    } );

  }

  // If there is a page called "Intro", show it the first time the app is used
  maybeShowIntro(slug) {

    this.introshown = window.localStorage.getItem('app-intro-shown');

    if( this.introshown === "true" ) 
      return;

    this.showingIntro = true;

    let page_id = this.getPageIdBySlug(slug);
    if(!page_id) {
      page_id = this.getTabIndexBySlug(slug);
    }

    if(page_id) {
      let intro = { 'title': "Introduction", 'component': this.getPageModuleName(page_id), 'class': "", 'navparams': { 'slug': slug } };
      this.nav.push( this.getPageModuleName(page_id), intro.navparams );
    } else {
      throw('page_id for intro not found');
    }


    window.localStorage.setItem('app-intro-shown', "true" );
  }

  /**
   * Get side menu index by page slug
   */
  getMenuIndexBySlug(slug: string) {
    return this.menuservice.getIndexBySlug(slug, this.pages);
  }

  /**
   * Get tab menu index by page slug
   * @param slug page slug
   */
  getTabIndexBySlug(slug: string) {
    return this.menuservice.getIndexBySlug(slug, this.tabs);
  }

  getPageIdBySlug(slug) {

    let page_id = 0;

    if(this.pages && this.pages.length) {
      this.pages.forEach(page => {
        if(page.slug && page.slug == slug && page.page_id)
          page_id = page.page_id;
      });
    } else {
      return false;
    }

    return page_id;
  }

  getPageBySlug(slug) {

    let mypage: any;

    if(this.pages && this.pages.length) {
      this.pages.forEach(page => {
        if(page.slug && page.slug == slug && page.page_id)
          mypage = page;
      });
    }

    return mypage;
  }

  // side menu link. determine which func to use
  menuLink(p, e) {

    if( p.extra_classes.indexOf('submenu-parent') >= 0 ) {
      this.doSubMenus(e)
      return;
    }

    if( this.bothMenus || ( p.extra_classes && p.extra_classes.indexOf('push-page') >= 0 ) ) {
      this.pushPage(p);
    } else {
      this.openPage(p);
    }
  }

  // Handles opening and closing submenus
  doSubMenus(e) {

    var button;
    if( e.target.classList && e.target.classList.contains('submenu-parent') ) {
      button = e.target;
    } else if( e.target.classList ) {
      button = e.target.closest('.submenu-parent');
    }

    if( button.classList && button.classList.contains('submenu-parent') ) {

      if( button.classList.contains('open-menu') ) {
        button.classList.remove('open-menu');
      } else {
        button.classList.add('open-menu');
      }

      var el = button.nextSibling;

      while( el.classList && el.classList.contains( 'submenu-child' ) ) {
        if( el.classList.contains( 'open' ) ) {
          el.classList.remove( 'open' );
        } else {
          el.classList.add( 'open' );
        }
        el = el.nextSibling;
      }
      return;

    }

  }

  /**
   * Open the login modal if the menu item's extra_classes contains 'yieldlogin'
   * @param extra_classes 
   */
  yieldLogin(extra_classes) {

    if(extra_classes && extra_classes.indexOf('yieldlogin') >= 0) {
      if(this.user) { // logged in
        return false;
      } else { // logged out, show login modal
        this.openLoginModal();
        return true;
      }
    }

    return false;
  }

  openPage(page) {

    // don't do anything if someone clicks a nav divider
    if( typeof( page.extra_classes ) != "undefined" && page.extra_classes.indexOf('divider') >= 0 )
      return

    if(this.yieldLogin(page.extra_classes))
      return

    // close the menu when clicking a link from the menu
    this.menu.close();

    if( page.target === '_blank' && typeof(page.extra_classes) !== 'undefined' && page.extra_classes.indexOf('system') >= 0 ) {
      this.openIab( page.url, '_system', null );
      return;
    } else if( page.target === '_blank' ) {
      this.openIab( page.url, page.target, null );
      return;
    } else if( typeof(page.extra_classes) !== 'undefined' && (page.extra_classes.indexOf('loginmodal') >= 0||page.extra_classes.indexOf('logoutmodal') >= 0) ) {
      this.openLoginModal({title:page.title});
      return;
    }

    let root = this.getPageType( page );
    console.log('open page root', root, page)

    if( root ) {
      this.nav.setRoot( root, page );
    } else if (page.url && page.root === "true") {

      console.log('doing learndash')

      // for LearnDash post messages, specifically course completion redirects

      // can't set root on tabs
      let first = this.nav.first();

      if( first.id === "TabsPage" ) {
        
        // if root is in the message, we pop to the root via tabs.ts
        return;
        

      } else {

        // learndash redirect with side menu
        this.nav.popToRoot({animate: false}).then( ()=> {
            this.nav.push( Iframe, page );
        })

        return;

      }

    }

  }

  pushPage(page) {

    // don't do anything if someone clicks a nav divider
    if( typeof( page.extra_classes ) != "undefined" && page.extra_classes.indexOf('divider') >= 0 )
      return

    if(this.yieldLogin(page.extra_classes))
      return

    // close the menu when clicking a link from the menu
    this.menu.close();

    if( page.target === '_blank' && page.extra_classes.indexOf('system') >= 0 ) {
      this.openIab( page.url, '_system', null );
      return;
    } else if( page.target === '_blank' ) {
      this.openIab( page.url, page.target, null );
      return;
    } else if( typeof(page.extra_classes) !== 'undefined' && (page.extra_classes.indexOf('loginmodal') >= 0||page.extra_classes.indexOf('logoutmodal') >= 0) ) {
      this.openLoginModal({title:page.title});
      return;
    }

    let opt = {};

    if( this.rtl === true && this.platform.is('ios') )
      opt = { direction: 'back' }

    let root = this.getPageType( page );

    console.log('push page type', root)

    this.nav.push( root, page, opt );

  }

  openTab(tab_index: number) {
    this.restoreTabs();
    let tabs = this.nav.getActiveChildNav();

    if(tabs) {
      this.nav.popToRoot({animate:true}).then(() => { // close any transitioned pages
          tabs.select(tab_index);
      });
    }
  }

  /**
   * Experimental: need to get this.removeNewTab() working
   * @param page object
   */
  openNewTab(page) {

    this.nav.popToRoot({animate:true}).then(() => { // close any transitioned pages
      this.restoreTabs();
      this.tabs.unshift(page);
      let loggedin = (typeof this.login_data === 'object');
      this.resetTabs(loggedin);
      this.nav.setRoot( 'TabsPage', this.navparams );
    });
  }

  /**
   * Restore the original tabs.
   */
  restoreTabs() {
    this.tabs = this.originalTabs.slice(); // copy back
  }

  openMenuLink(data: {menulink}) {

    let page: any;
    let menu_index: number;

    if(typeof data.menulink.menu !== 'undefined') { // might be 0; check undefined
      if(typeof data.menulink.menu === 'number')
        menu_index = data.menulink.menu;
      else if(typeof data.menulink.menu === 'string')
        menu_index = this.getMenuIndexBySlug(data.menulink.menu);
      if(typeof menu_index !== 'undefined')
        page = this.pages[menu_index];
    } else if(typeof data.menulink.tab_menu !== 'undefined') {
      if(typeof data.menulink.tab_menu === 'number')
        menu_index = data.menulink.tab_menu;
      else if(typeof data.menulink.tab_menu === 'string')
        menu_index = this.getTabIndexBySlug(data.menulink.tab_menu);
      if(typeof menu_index !== 'undefined')
        page = this.tabs[menu_index];
    }

    // Verify logins
    if(page && page.extra_classes) {
      if(page.extra_classes == 'loggedin' && typeof this.login_data != 'object') {
        this.translate.get('Please login').subscribe( text => {
          this.presentToast(text);
        });
        return;
      }
      if(page.extra_classes == 'loggedout' && typeof this.login_data == 'object') {
        console.log('login_data', this.login_data);
        page = null;
      }
    }

    if(page) {

      if(data.menulink.new_tab) {
        this.openNewTab(page);
      } else if(data.menulink.backbtn || typeof data.menulink.menu !== 'undefined') {
        this.pushPage(page);
      } else {
        this.openTab(menu_index);
      }
    } else {
      this.translate.get('Page not found').subscribe( text => {
        this.presentToast(text);
      });
    }
  }

  getPageModuleName(page_id) {
    if(!isDevMode())
      return 'Page'+page_id;
    if(false === this.globalvars.getUseDynamicPageModule()) // building on remote Ionic builder
      return 'Page'+page_id;
    else
      return 'CustomPage';
  }

  doStatusBar(data) {

    if( !this.StatusBar )
      return;

    if( data.meta.light_status_bar == true ) {
      // Light text, for dark backgrounds
      this.StatusBar.styleLightContent();
    } else {
      // Dark text
      this.StatusBar.styleDefault();
    }

    // Android only, background color
    if( this.platform.is('android') ) {
      if( data.meta.design && data.meta.design.status_bar_bkg ) {
        this.StatusBar.backgroundColorByHexString(data.meta.design.status_bar_bkg);
      }
    }

  }

  doConnectionEvents() {

    this.networkState = this.Network.type;

    if( this.networkState === 'none' || this.networkState === 'unknown' ) {
      this.translate.get('You appear to be offline, app functionality may be limited.').subscribe( text => {
        this.presentToast(text);
      });
    }

  }

  loadStyles( data ) {

    // console.log( data );

    // kinda hacky, but it works
    let styles = "<style>";

    // toolbar color
    styles += ".toolbar-background-md, .toolbar-background-ios, .tabs-md .tabbar, .tabs-ios .tabbar, .custom-page .menu-card { background: " + data.meta.design.toolbar_background + " }";

    // toolbar text
    styles += ".toolbar-content, .toolbar-title, .bar-button-default, .toolbar .bar-button-default:hover, .toolbar .segment-button, .toolbar button.activated, .tabs .tab-button .tab-button-icon, .tab-button .tab-button-text, .tabbar .tab-button[aria-selected=true] .tab-button-icon, ion-toolbar .button { color: "  + data.meta.design.toolbar_color + " }";

    // left menu colors
    styles += ".menu-inner .content-md, .menu-inner .content-ios, .menu-inner ion-list .item { color: "  + data.meta.design.left_menu_text + "; background-color: "  + data.meta.design.left_menu_bg + " }";
    styles += ".menu-inner .loggedin-msg { color: "  + data.meta.design.left_menu_text + " }";

    // left menu icon color
    if( data.meta.design.left_menu_icons ) {
      styles += "ion-menu .list-md ion-icon, ion-menu .list-ios ion-icon, .menu-inner .submenu-parent::after { color: "  + data.meta.design.left_menu_icons + " }";
      styles += ".menu-inner .item-ios[detail-push] .item-inner, .menu-inner button.item-ios:not([detail-none]) .item-inner, .menu-inner a.item-ios:not([detail-none]) .item-inner { background-image: url(\"data:image/svg+xml;charset=utf-8,<svg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2012%2020'><path%20d='M2,20l-2-2l8-8L0,2l2-2l10,10L2,20z'%20fill='" + data.meta.design.left_menu_icons + "'/></svg>\"); }";
    }

    // body text and background
    styles += ".ion-page ion-content, .ion-page ion-list .item { color: "  + data.meta.design.text_color + "; background-color: "  + data.meta.design.body_bg + " }";
    styles += "p, .item p { color: "  + data.meta.design.text_color + " }";

    // buttons
    styles += ".button-primary, .menu-login-button, page-login-modal div > .button, bp-modal .button, bp-list .badge, bp-details .badge, bp-messages .button { background: " + data.meta.design.button_background + "!important; color: "  + data.meta.design.button_text_color + " }";
    styles += "bp-list .button, bp-details .button, bp-group .button, bp-profile .button { color: "  + data.meta.design.button_background + " }";

    // headings
    styles += "ion-page h1, ion-page h2, ion-page h3, ion-page h4, ion-page h5, ion-page h6, ion-page ion-list .item h2, ion-page ion-list .item h3, ion-page ion-list .item h4 { color: "  + data.meta.design.headings_color + " }";

    // links
    styles += "ion-page ion-content a, ion-page ion-content a:visited { color: "  + data.meta.design.link_color + " }";

    styles += data.meta.design.custom_css;

    // hide menu toggle if no left menu
    if( this.showmenu === false ) {
      styles += 'ion-navbar .bar-button-menutoggle { display: none !important; }';
    }

    // maybe move menu item to right
    if( this.menu_side === "right" && this.rtl === false || this.menu_side === "left" && this.rtl === true ) {
      styles += 'ion-navbar .bar-buttons[start] { order: 7; }';
    }

    styles += "</style>";

    this.styles = this.sanitizer.bypassSecurityTrustHtml( styles );
    
  }

  /* 
  * We are listening for postMessage events from the iframe pages. When something needs to happen, a message is sent from the iframe as a JSON object, such as { iablink: 'http://apppresser.com', target: '_blank', options: '' }. We parse that object here, and do the phonegap stuff like window.open(data.iablink)
  */

  attachListeners() {

    // When WP site loads, attach our click events
    window.addEventListener('message', (e) => {

      // might be undefined, but we only using strings here
      if( typeof e.data !== 'string' || e.data == '' )
        return;

      console.log('postMessage', e.data);

      if( e.data === 'checkin_success' ) {

        this.translate.get('Check in successful!').subscribe( text => {
          this.presentToast(text);
        });

      } else if ( e.data === 'logout' ) {

        this.userLogout()

      }

      // if it's not our json object, return
      if (e.data.indexOf('{') != 0)
        return;

      var data = JSON.parse(e.data);

      if (data.url) {

        // push a new page
        let page = { title: data.title, component: Iframe, url: data.url, classes: null };
        this.pushPage( page );

      } else if (data.msg) {

        // social sharing was clicked, show that
        this.SocialSharing.share(data.msg, null, null, data.link);

      } else if (data.iablink) {

        // in app browser links
        this.openIab(data.iablink, data.target, data.options);

      } else if (data.camera && data.camera === 'library' ) {

        if(data.appbuddy === true ) {
          this.appCamera.photoLibrary(true);
        } else {
          this.appCamera.photoLibrary(false);
        }

      } else if (data.camera && data.camera === 'photo') {
        
        if (data.appbuddy === true) {
          this.appCamera.openSheet(true);
        } else {
          this.appCamera.takePicture(false);
        }

      } else if ( data.fblogin ) {

        this.fbconnectIframe.login();

        this.maybeSendPushId( data.ajaxurl );

      } else if ( data.paypal_url ) {

        this.appwoo.paypal( data.paypal_url, data.redirect );

      } else if( data.loggedin ) {

        let avatar = this.logins.get_avatar(data); // logic for FB or WP
        if(avatar)
          data.avatar = avatar;

        this.userLogin(data)

        this.storage.set('user_login', this.login_data )

      } else if( typeof( data.isloggedin ) != "undefined" ) {

        // make sure app and WP have the same status
        this.syncLoginStatus( data )

      } else if( data.apppage ) {

        let page = { title: data.title, component: Iframe, url: data.apppage.url, classes: null, page_type: null, type: null, root: data.apppage.root };
        this.openPage( page );

      } else if( data.geouserpref ) {

        this.appgeo.startBeacon( data.geouserpref );

      } else if( data.menulink ) {

        this.openMenuLink( data );

      } else if( data.download_url ) {

        this.downloadItem( data );

      }

    }, false); // end eventListener

    if( this.iphoneX ) {

      // css hacks for iphone x status bar
      window.addEventListener( "orientationchange", () => { 
        
        if( !window.orientation && window.orientation == 0 ) {
          this.customClasses = 'iphoneX-portrait'
        } else if( window.orientation && window.orientation === -90 ) {
          this.customClasses = 'iphoneX-landscape'
        }

      }, false );

    }

  }

  openIab( link, target, options = null ) {

    window.open(link, target, options );

  }

  maybeDoAds(data) {

    // only show ads on a device
    if( !this.Device.platform ) 
      return;

    // If we don't have any ads set, stop
    if( data.ads.ios === '' && data.ads.android === '' ) {
      console.log('No ads');
      return;
    }

    // this.appads.setOptions();

    if( this.Device.platform === 'iOS' && data.ads.ios.banner != '' ) {
      this.appads.createBanner( data.ads.ios.banner );
    }
     
    if( this.Device.platform === 'Android' && data.ads.android.banner != '' ) {
      this.appads.createBanner( data.ads.android.banner );
    }

    // show interstitial like this
    // this.appads.interstitial( data.ads.ios.interstitial );

  }

  maybeDoPush() {

    let push = null;

    try {

      push = this.Push.init({
        android: {
            icon: "phonegap",
            senderID: "[[gcm_sender]]"
        },
        ios: {
            alert: "true",
            badge: true,
            clearBadge: true,
            sound: 'true'
        },
        windows: {}
      });

    } catch(err) {
      console.log(err);
      return;
    }

    if( push.error )
      return;

    push.on('registration').subscribe((data: any) => {

      this.storage.set('deviceToken', data.registrationId)

      this.regId = data.registrationId;

      this.storage.get('endpointArn').then( res => {

        let update: string = window.localStorage.getItem( 'myappp_update' );

        // If already subscribed, don't hit API again. Updating API version bypasses so everyone resubscribes.
        if( res && update != 'true' ) {
          return;
        }

        // Subscribe through myapppresser.com api
        this.pushService.subscribeDevice( this.regId ).then( (result:string) => {

          var newresult = JSON.parse( result );

          this.storage.set('endpointArn', newresult.endpointArn )

        });

      } );

    });

    push.on('notification').subscribe((data: any) => {

      let isAppPushPostURL = ( data.additionalData && data.additionalData.url && data.additionalData.url.indexOf('http') == 0 && data.additionalData.target && data.additionalData.target == '_self' );
      let isAppPushCustomURL = ( data.additionalData && data.additionalData.url && data.additionalData.url.indexOf('http') == 0 );
      let isAppPage = ( data.additionalData && (<any>data).additionalData.page );

      // Don't allow resetTabs to happen if we need to pushPage from notification: it messes things up
      if( isAppPushPostURL || isAppPushCustomURL || isAppPage ) {
        this.doingNotification = true;
      }

      this.Dialogs.alert(
        data.message,  // message
        data.title,    // title
        this.translate.instant('Done')  // buttonName
      ).then(() => {

        // Now we can allow resetTabs to happen
        this.doingNotification = false;

        // if apppush post URL
        if(isAppPushPostURL) {
          let page = { title: data.title, component: Iframe, url: data.additionalData.url, classes: null };
          this.pushPage( page );
          return;
        }

        // if there's an external url from apppush custom url field, open in IAB
        if(isAppPushCustomURL) {
          this.openIab( data.additionalData.url, '_blank' );
          return;
        }

        // if there's an app page, open it
        if(isAppPage) {

          let page = (<any>data).additionalData.page;

          // if page is external, fire the in app browser
          if( page.target === '_blank' ) {
            this.openIab( page.url, page.target );
            return;
          }

          // if they included an app page, load the page
          this.pushPage( (<any>data).additionalData.page );
        }

      }); // then

    });

    push.on('error').subscribe((e) => {
      console.log(e.message);
    });

  }

  maybeSendPushId( ajaxurl? ) {

    if(!ajaxurl)
      ajaxurl = this.getAjaxURL();

    if(!ajaxurl) {
      console.log('Not able to send endpointArn, missing ajaxurl');
      return;
    }

    this.storage.get('endpointArn').then( id => {

      if( id ) {
        // ajax call to save this to user meta
        this.pushService.sendDeviceToWp(id, ajaxurl).then( result => {
          console.log(result);
        });
      }

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

  menuOpened() {
    this.menu.swipeEnable(true)
  }

  menuClosed() {
    this.menu.swipeEnable(false)
  }

  openLoginModal(opt?: ModalOptions) {

    const css = (opt && opt.cssClass) ? opt.cssClass : '';
    const params = (opt && opt.title) ? {title: opt.title} : {};
	
		if(!this.myLoginModal) {
      this.myLoginModal = this.modalCtrl.create('LoginModal', params, {
        cssClass: css
      });
    }

    this.myLoginModal.onDidDismiss(data => {
			this.myLoginModal_open = false;
		});

		if( this.myLoginModal_open === false) {
      this.myLoginModal_open = true;
			this.myLoginModal.present();
		}

  }

  userLogin(data) {

    let avatar = this.logins.get_avatar(data);

    if(avatar)
      data.avatar = avatar;

    this.login_data = data;

    this.loginservice.setLoginStatus(new User(data));

    this.maybeSendPushId();
    // tell the modal we are logged in
    this.events.publish('modal:logindata', data )

    this.translate.get('Login successful').subscribe( text => {
      this.presentToast(text);
    });
    
    this.maybeLogInOutRedirect(data);

    if( this.pages )
      this.resetSideMenu(true)

    if( this.tabs )
      this.resetTabs(true)
  }

  /**
   * Handle the appp_login_redirect filter from WordPress
   * @param data Login data
   */
  maybeLogInOutRedirect(data) {

    let redirect: any;

    if(data.login_redirect)
      redirect = data.login_redirect;
    else if(data.logout_redirect)
      redirect = data.logout_redirect;
    
    if(redirect) {
      console.log('redirecting to ', redirect);

      let page: object|boolean;
      let title = '';
      let url = '';

      if(typeof redirect === 'string') {
        url = redirect;
      } else if(typeof redirect === 'object') {
        title = redirect.title;
        url = redirect.url;
      }

      if(!url) {
        return;
      } else if(url.indexOf('http') === -1) {

        // load by page slug

        let page_slug = url;
        page = this.getPageBySlug(page_slug);
        if(page) {
          this.pushPage(page);
        } else {
          this.translate.get('Page not found').subscribe( text => {
            this.presentToast(text);
          });
        }
      } else {

        // load by URL

        page = { 
          title: title,
          url: url,
          component: Iframe,
          classes: null,
          target: '',
          extra_classes: '',
        };
        
        this.pushPage(page);
      }   
    }
  }
  userLogout(logout_response?) {
    // this.storage.remove('user_login').then( () => {
    //   this.presentToast('Logged out successfully.')
    // })

    this.login_data = null;
    this.loginservice.removeLoginStatus();

    if( this.tabs && this.pages ) {
      this.resetTabs(false)
      this.resetSideMenu(false)
    } else if( this.tabs ) {
      this.resetTabs(false)
    } else {
      this.resetSideMenu(false)
      // this.openPage(this.pages[0])
    }

    this.translate.get('Logout successful').subscribe( text => {
      this.presentToast(text);
    });

    this.storage.get('force_login').then( data => {
      if(data) {
        this.openLoginModal();
      } else if(logout_response && logout_response.data && logout_response.data.logout_redirect) {
        this.maybeLogInOutRedirect(logout_response.data);
      }
    }).catch( e => {
      console.warn(e)
    });

  }

  // show or hide menu items on login or logout. resetSideMenu(false) for logout
  resetSideMenu( login ) {
    for( let item of this.pages ) {

      if( login === true && item.extra_classes.indexOf('loggedin') >= 0 ) {
        item.extra_classes += " show";
      } else if( login === false && item.extra_classes.indexOf('loggedin') >= 0 ) {
        item.extra_classes = item.extra_classes.replace(" show", "");
      } else if( login === true && item.extra_classes.indexOf('loggedout') >= 0 ) {
        item.extra_classes += " hide";
      } else if( login === false && item.extra_classes.indexOf('loggedout') >= 0 ) {
        item.extra_classes = item.extra_classes.replace(" hide", "");
      }

    }
  }

  /**
   * Show or hide tabs on login or logout. resetTabs(false) for logout
   * @param login Boolean
   */
  resetTabs( login, lang_updated? ) {

    if(this.doingNotification)
      return; // We can't reset the tabs now if a push notification has opened the app and has a pushPage included

    this.navparams = []

    if(typeof(this.tabs) === 'undefined')
      return;

    login = (typeof login === 'undefined') ? false : login;
    
    for( let item of this.tabs ) {

      // set component, default is Iframe
      var root:any = Iframe;

      if( item.root ) {
        root = item.root
      } else {
        root = this.getPageType( item );
      }

      // hide the tab if user added class of hide
      item.show = true;
      if( item.extra_classes.indexOf('hide') >= 0 ) {
        item.show = false;
      }

      if( !login && item.extra_classes.indexOf('loggedin') >= 0 ) {
        item.show = false;
      } else if( login && item.extra_classes.indexOf('loggedout') >= 0 ) {
        item.show = false;
      }

      item.class = item.icon

      // add lang=xx param
      if(root == Iframe && item.url && item.url.indexOf('http') == 0) {
        // console.log('MyAppp resetTabs Iframe change url start', item.url)
        item.url = this.languageservice.appendUrlLang(item.url);
        // console.log('MyAppp resetTabs Iframe change url end', item.url)
      }

      this.navParamsPush( item, root )

    }

    this.tabs = this.navparams.slice();
    this.menuservice.tabs = this.navparams.slice();

    // "refresh" the view by resetting to home tab
    //this.openPage( { 'title': this.tabs[0].title, 'url': '', 'component': 'TabsPage', 'navparams': this.navparams, 'class': this.tabs[0].icon } )
    
    this.zone.run( () => {
      // If the login/out has a redirect, we don't want to set the root here
      if(!login || lang_updated) {

        if(lang_updated) {

          if(this.showingIntro) {

            // Don't refresh the tabs if showing the intro now
            setTimeout(() => {
              this.showingIntro = false;
            }, 6000);
      
            return;
          }

          // some craziness to update Iframe components in the TabsPage Tab
          // bug fix: https://trello.com/c/Q3qlMxOU/999-language-options-and-iframe-tab-conflict
          this.nav.popToRoot(this.navparams).then(()=>{
            (<Nav>this.nav.getActiveChildNav()).goToRoot(this.navparams).then(() => {
              this.nav.setRoot( 'TabsPage', this.navparams );
            });
          });
        } else {

          // reset the tabs
          this.nav.setRoot( 'TabsPage', this.navparams );
        }
      } else {
        
        // fixes bug where tabs don't reset after login
        this.nav.setRoot( 'TabsPage', this.navparams );

      }
    } )

  }

  getSetLogin() {

    this.storage.get('user_login').then( data => {
        if(data) {

          let avatar = this.fbconnectvars.get_avatar();
          if(avatar)
            data.avatar = avatar;

          this.login_data = data;

          this.loginservice.setLoginStatus(new User(data))
          
          if( this.pages )
            this.resetSideMenu(true)

          if( this.tabs )
            this.resetTabs(true)
    
        }
    })

  }

  getSetLang( data ) {

    if(data.languages) {
      this.storage.set('available_languages', data.languages)
      this.languageservice.setAvailable(data.languages);
    } else {
      this.storage.remove('available_languages');
      this.languageservice.setAvailable(null);
    }

    this.storage.get( 'app_language' ).then( lang => {
      if( lang ) {

        let language = new Language(lang);

        this.translate.use( language.code );
        this.languageservice.setCurrentLanguage(language);

        this.setBackBtnText();
        
      }
    })

  }

  syncLoginStatus( data ) {

    // sync login status. If WP and app doesn't match up, fix it

    if( data.isloggedin == false && this.login_data ) {

      // logged out of WP but still logged into app: log out of app
      this.login_data = null
      this.storage.remove('user_login');
      this.loginservice.removeLoginStatus();
      this.events.publish( 'modal:logindata', null )
      this.events.publish( 'user:logout', null );

    } else if( data.isloggedin == true && !this.login_data ) {

      // logged into WP but logged out of app: log into app
      if( data.avatar_url && data.message ) {
        this.login_data = { loggedin: true, avatar: this.logins.get_avatar(data.avatar_url), message: data.message, username: '' }
      } else {
        this.login_data = { loggedin: true, username: '' }
      }


      this.storage.set('user_login', this.login_data ).then( () => {

        this.loginservice.setLoginStatus(new User(this.login_data))
        this.events.publish( 'modal:logindata', this.login_data )

      })
      
    }

  }

  getAjaxURL() {

    if(!this.ajax_url) {
      let item = window.localStorage.getItem( 'myappp' );
      let myapp = JSON.parse( item );
      if(myapp.wordpress_url) {
        this.ajax_url = myapp.wordpress_url + 'wp-admin/admin-ajax.php';
      } else {
        return '';
      }
    }

    return this.ajax_url;
    
  }

  verifyLanguageFile(data) {
    // check if language file exists. If not, default to en.json
    this.languageservice.langFileExists(data).then( data => {
      const langData = (<Language>data);

      // console.log(`set language to ${langData.code} and dir to ${langData.dir}`);

      this.rtl = (langData.dir && langData.dir == 'rtl');

      let language = new Language({
        code: langData.code,
        dir: (langData.dir && langData.dir == 'rtl') ? 'rtl' : 'ltr'
      });

      this.translate.setDefaultLang(language.code);
      this.languageservice.setCurrentLanguage(language);
      this.setBackBtnText();
    });
  }

  setBackBtnText() {

    this.translate.get('Back').subscribe( text => {
      console.log('Back ' + text )
      this.config.set('ios', 'backButtonText', text );
    });

  }

  // download item from WP, add to storage
  downloadItem( data ) {

    if( !this.Device.platform ) 
      return;

    console.log(data)

    const loading = this.loadingCtrl.create({
        showBackdrop: false,
        //dismissOnPageChange: true
    });

    loading.present(loading);

    this.download.downloadFile( data.download_url ).then( downloadUrl => {

      if( !downloadUrl )
        return;

      this.storage.get( 'downloads' ).then( downloads => {

        if( downloads ) {

          downloads.push( { title: data.download_title, url: downloadUrl } )

        } else {

          downloads = [ { title: data.download_title, url: downloadUrl } ]

        }

        this.storage.set( 'downloads', downloads )

      });

      this.translate.get('Download successful.').subscribe( text => {
        this.presentToast(text);
      });

      if( loading )
        loading.dismiss();

    })
    .catch( err => {
      
      console.warn( err )

      if( loading )
        loading.dismiss();
    })

  }

  doIphoneX() {

    // hack for iphonex status bar
    if( this.Device && this.Device.model ) {
      let model = this.Device.model.toLowerCase();

      if( model.indexOf('iphone10') >= 0 ) {

        this.iphoneX = true;

        if( this.platform.isLandscape() ) {
          this.customClasses = 'iphoneX-landscape'
        } else {
          this.customClasses = 'iphoneX-portrait'
        }
        
      }
    }

  }

  getPageType( page ) {

    if( page.type === 'apppages' && page.page_type === 'list' ) {
      return 'PostList';
    } else if( page.type === 'apppages' && page.page_type === 'media-list' ) {
      return 'MediaList';
    } else if( page.type === 'apppages' && page.page_type === 'bp-list' ) {
      
      // maybe load profile page. It has type of bp-list even though it's not a bp-list page. Awkward I know.
      if( page.list_route === 'profile' ) {
        return 'BpProfilePage';
      } else if( page.list_route === 'messages' ) {
        return 'BpMessages';
      } else {
        return 'BpList';
      }
      
    } else if( page.type === 'apppages' ) {
      return this.getPageModuleName(page.page_id);
    } else if( page.url && !page.root ) {
      return Iframe;
    } else {
      return null;
    }

  }

}