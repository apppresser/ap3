/* Framework */
import {ViewChild, Component} from '@angular/core';
import {ionicBootstrap, Platform, MenuController, Nav} from 'ionic-angular';
import {DomSanitizationService} from '@angular/platform-browser';

/* Pages */
import {SlidePage} from './pages/slides/slides';
import {ListPage} from './pages/list/list';
import {PostList} from './pages/post-list/post-list';
import Iframe from './pages/iframe';
import {TabsPage} from './pages/tabs/tabs';
import {MapPage} from './pages/google-map/google-map';
import {CustomPage} from './pages/custom-pages/custom-page';

/* Providers (make sure to add to ionicBootstrap below) */
// import {MenuProvider} from './providers/menu/menu';
import {AppCamera} from './providers/camera/app-camera';
import {Posts} from './providers/posts/posts';
import {GlobalVars} from './providers/globalvars/globalvars';
import {AppAds} from './providers/appads/appads';
import {FbConnect} from './providers/facebook/facebook';
import {PushService} from './providers/push/push';
import {AppWoo} from './providers/appwoo/appwoo';
import {AppData} from './providers/appdata/appdata';

/* Native */
import {StatusBar, SocialSharing, Device, InAppBrowser, Splashscreen} from 'ionic-native';

@Component({
  templateUrl: 'build/app.html'
})

export class MyApp {
  @ViewChild(Nav) nav: Nav;

  pages: any;
  styles: any;
  siteurl: string;
  apiurl: string;
  apppSettings: any;
  login: boolean;
  slides: any;
  navparams: any = [];
  tabs: any;

  constructor(
    private platform: Platform,
    public appCamera: AppCamera,
    private menu: MenuController,
    private globalvars: GlobalVars,
    private appads: AppAds,
    private fbconnect: FbConnect,
    private sanitizer: DomSanitizationService,
    private pushService: PushService,
    private appwoo: AppWoo,
    private appdata: AppData
  ) {

    this.siteurl = globalvars.getUrl();
    this.apiurl = globalvars.getApi();

    this.initializeApp();

    // get our app data, then use it. will return either local data, or get from api
    this.appdata.load(this.apiurl).then( (data) => {

      this.loadMenu(data);
      this.loadStyles(data);

    }).catch( e => {

      // if there's a problem, default to app-data.json
      console.log( 'problem getting appdata', e );

      this.appdata.getData( 'app-data.json' ).then( data => {
        console.log('Got local data file.');
      });

    });

  }

  loadMenu(data) {
    // any menu imported from WP has to use same component. Other pages can be added manually with different components

    // this.login = true;

    if( data.tab_menu.items ) {

      for( let item of data.tab_menu.items ) {
        this.navparams.push( { 'title': item.title, 'url': item.url, 'root': Iframe, 'icon': item.class } );
      }

      this.tabs = this.navparams;

      this.nav.setRoot(TabsPage, this.tabs);

    }

    if( data.menus.items ) {

      this.pages = data.menus.items;

      // this is how we will use different components
      /* for( let item of data.menus.items ) {
        if( item.tabs ) {
          this.pages.push = ( { 'title': item.title, 'url': '', 'component': TabsPage, 'navparams': item.tabs, 'icon': item.classes } );
        } else if( item.url ) {
          this.pages.push = ( { 'title': item.title, 'url': item.url, 'component': Iframe, 'icon': item.classes } );
        } else if( item.map ) {
          this.pages.push = ( { 'title': item.title, 'url': item.url, 'component': Map, 'icon': item.classes } );
         } else if(item.slides ) {
          Slides.doSlides( item.slides );
         }
      }
      } */

      // Add pages manually here, can use different components like this...
      // let a = { 'title': 'Tabs', 'url': '', 'component': TabsPage, 'navparams': [
      //   { title: "Schedule", root: ListPage, icon: "calendar" },
      //   { title: "Speakers", root: PostList, icon: "contacts" },
      //   { title: "Map", root: MapPage, icon: "map" },
      //   { title: "New Page", root: NewPage, icon: "information-circle" },
      // ] };
      let b = { 'title': 'WP Posts', 'url': '', 'component': PostList };
      let c = { 'title': 'Local Posts', 'url': '', 'component': ListPage };
      let d = { 'title': 'Map', 'url': '', 'component': MapPage };
      let e = { 'title': "Custom Page", 'component': CustomPage, 'class': "information-circle", 'navparams': 'custom' };
      

      this.pages.push( b, c, d, e );

      if( !this.tabs ) {
        this.nav.setRoot( Iframe, data.menus.items[0] );
      } else {
        // if tabs exist, need to add to menu
        this.pages.unshift( { 'title': data.tab_menu.name, 'url': '', 'component': TabsPage, 'navparams': this.navparams, 'class': 'home' } )
      }

    }

  }

  openPage(page) {

    // this.menuProvider.openPage( page );

    console.log(page);

    // close the menu when clicking a link from the menu
    this.menu.close();

    if( page.type === 'apppages' ) {
      this.nav.setRoot( CustomPage, page.slug );
    } else if (page.url) {
      this.nav.setRoot(Iframe, page);
    } else {
      this.nav.setRoot(page.component, page.navparams);
    }

    // when dynamic components are enabled, delete above code and use this instead
    // this.nav.setRoot(page.component, page.navparams );
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();

      Splashscreen.hide();

      this.attachListeners();

      if( Device.device.platform === 'iOS' || Device.device.platform === 'Android' )
        this.pushService.register();

      setTimeout( () => {
        // run this in the background, then we can update the data on next app load if needed
        this.appdata.checkForUpdates( this.apiurl );
      }, 9000 );
      

    });

  }

  loadStyles( data ) {

    console.log( data );

    // kinda hacky, but it works
    let styles = "<style>";

    // toolbar color
    styles += ".toolbar-background, ion-tabbar { background: " + data.meta.design.toolbar_background + " }";

    // toolbar text
    styles += ".toolbar-title, .bar-button-default, .toolbar .bar-button-default:hover, .toolbar .segment-button, .toolbar button.activated, .tab-button, .tab-button[aria-selected=true], ion-toolbar .button { color: "  + data.meta.design.toolbar_color + " }";

    // left menu colors
    styles += "ion-menu ion-content, ion-menu ion-list .item { color: "  + data.meta.design.left_menu_text + "; background-color: "  + data.meta.design.left_menu_bg + " }";

    // body text and background
    styles += "ion-content, ion-list .item { color: "  + data.meta.design.text_color + "; background-color: "  + data.meta.design.body_bg + " }";
    styles += "p, .item p { color: "  + data.meta.design.text_color + " }";

    // buttons
    styles += ".button-primary { background: " + data.meta.design.button_background + "!important; color: "  + data.meta.design.button_text_color + " }";

    // headings
    styles += "h1, h2, h3, h4, h5, h6, ion-list .item h2, ion-list .item h3, ion-list .item h4 { color: "  + data.meta.design.headings_color + " }";

    // links
    styles += "ion-content a, ion-content a:visited { color: "  + data.meta.design.link_color + " }";

    // hide menu toggle if no left menu
    // if( !this.pages ) {
    //   styles += 'ion-navbar .bar-button-menutoggle { display: none !important; }';
    // }

    styles += "</style>";

    this.styles = this.sanitizer.bypassSecurityTrustHtml( styles );
    
  }

  /* 
  * We are listening for postMessage events from the iframe pages. When something needs to happen, a message is sent from the iframe as a JSON object, such as { iablink: 'http://apppresser.com', target: '_blank', options: '' }. We parse that object here, and do the phonegap stuff like window.open(data.iablink)
  */

  attachListeners() {

    // When WP site loads, attach our click events
    window.addEventListener('message', (e) => {

      console.log('postMessage', e.data);

      // if it's not our json object, return
      if (e.data.indexOf('{') != 0)
        return;

      var data = JSON.parse(e.data);

      if (data.url) {

        // push a new page
        let page = { title: data.title, component: Iframe, url: data.url, classes: null };
        this.nav.push(Iframe, page);

      } else if (data.msg) {

        // social sharing was clicked, show that
        SocialSharing.share(data.msg, null, null, data.link);

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

        this.fbconnect.login();

      } else if ( data.paypal_url ) {

        this.appwoo.paypal( data.paypal_url, data.redirect );

      }

    }, false); // end eventListener

  }

  openIab( link, target, options = null ) {
    InAppBrowser.open(link, target, options );
  }

  maybeDoAds() {

    if(!Device.device.platform ) return;

    let ad_units: { ios: any, android: any } = null;
    ad_units.ios  = { banner: this.apppSettings.admob_ios_banner,
      interstitial: this.apppSettings.admob_ios_interstitial };
    ad_units.android = { banner: this.apppSettings.admob_android_banner,
      interstitial: this.apppSettings.admob_android_interstitial };

    // If we don't have any ads set, stop
    if( ad_units.ios.banner + ad_units.ios.interstitial + ad_units.android.banner + ad_units.android.interstitial === '' ) {
      console.log('no ads, bail');
      return;
    }

    this.appads.setOptions( this.apppSettings );

    // If we have a banner id, show on the proper platform
    if( Device.device.platform === 'iOS' && ad_units.ios.banner != '' ) {
      this.appads.createBanner( ad_units.ios.banner );
    } else if( Device.device.platform === 'Android' && ad_units.android.banner != '' ) {
      this.appads.createBanner( ad_units.android.banner );
    }

    // show interstitial like this
    // this.appads.interstitial( ad_units.ios.interstitial );

  }

}

// Pass the main app component as the first argument
// Pass any providers for your app in the second argument
// Set any config for your app as the third argument:
// http://ionicframework.com/docs/v2/api/config/Config/

ionicBootstrap(MyApp, [Posts, AppCamera, GlobalVars, AppAds, FbConnect, PushService, AppWoo, AppData], {
  tabbarPlacement: 'bottom',
  // http://ionicframework.com/docs/v2/api/config/Config/
})