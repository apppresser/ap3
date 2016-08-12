/* Framework */
import {ViewChild, Component} from '@angular/core';
import {ionicBootstrap, Platform, MenuController, Nav} from 'ionic-angular';
import {DomSanitizationService} from '@angular/platform-browser';

/* Pages */
import {HelloIonicPage} from './pages/hello-ionic/hello-ionic';
import {NewPage} from './pages/new-page/new-page';
import {ListPage} from './pages/list/list';
import {PostList} from './pages/post-list/post-list';
import Iframe from './pages/iframe';
import {TabsPage} from './pages/tabs/tabs';

/* Providers (make sure to add to ionicBootstrap below) */
import {Menus} from './providers/menus/menus';
import {AppCamera} from './providers/camera/app-camera';
import {Posts} from './providers/posts/posts';
import {Styles} from './providers/styles/styles';
import {GlobalVars} from './providers/globalvars/globalvars';
import {AppAds} from './providers/appads/appads';
import {FbConnect} from './providers/facebook/facebook';

/* Native */
import {StatusBar, SocialSharing, Device} from 'ionic-native';

@Component({
  templateUrl: 'build/app.html',
})

class MyApp {
  @ViewChild(Nav) nav: Nav;

  // make HelloIonicPage the root (or first) page
  rootPage: any = NewPage;
  pages: Array<{title: string, url: string, component: any, classes: any}>;
  styles: string;
  siteurl: string;
  apiurl: string;
  apppSettings: any;
  login: boolean;

  constructor(
    private platform: Platform,
    public menuService: Menus,
    public styleService: Styles,
    public appCamera: AppCamera,
    private menu: MenuController,
    private globalvars: GlobalVars,
    private appads: AppAds,
    private fbconnect: FbConnect,
    private sanitizer: DomSanitizationService
  ) {

    this.siteurl = globalvars.getUrl();
    this.apiurl = globalvars.getApi();

    this.globalvars.getSettings().then( result => {
      // TODO: save these to localStorage so we only have to get them once
      this.apppSettings = result;

      // need settings for ads, so wait to do them
      // TODO: uncomment line below based on build form if ads are checked
      // this.maybeDoAds();

      // set our app's pages
      this.loadMenu();

    });

    this.loadStyles();

    this.initializeApp();

  }

  loadMenu() {
    // any menu imported from WP has to use same component. Other pages can be added manually with different components

    this.login = true;

    this.menuService.load( this.apiurl + 'menus/' + this.apppSettings.primary_menu ).then( pages => {
      // Loads menu from WordPress API
      this.pages = pages;

      // Add pages manually here, can use different components like this...
      let a = { 'title': 'Tabs', 'url': '', 'component': TabsPage };
      let b = { 'title': 'WP Posts', 'url': '', 'component': PostList };
      let c = { 'title': 'Local Posts', 'url': '', 'component': ListPage };
      let d = { 'title': 'New Page', 'url': '', 'component': NewPage, 'classes': 'home' };

      this.pages.push(a, b, c, d);

    });

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();

      // this.push.register().then( result => {
      //   console.warn(result);
      // }, (err) => {
      //   console.warn(err);
      // });

      this.attachListeners();

    });

  }

  loadStyles() {

    this.styleService.load( this.apiurl + 'colors' ).then( result => {

      // kinda hacky, but it works
      let styles = "<style>";

      // toolbar color
      styles += ".toolbar-background, tabbar { background: " + result.top_bar_bg_color + " }";

      // toolbar text
      styles += ".toolbar-title, .bar-button-default, .toolbar .bar-button-default:hover, .toolbar .segment-button, .toolbar button.activated, .tab-button, .tab-button[aria-selected=true] { color: "  + result.top_bar_text_color + " }";

      // left menu colors
      styles += "ion-menu ion-content, ion-menu ion-list .item { color: "  + result.left_menu_text + "; background-color: "  + result.left_menu_bg + " }";

      // body text and background
      styles += "ion-content, ion-list .item { color: "  + result.text_color + "; background-color: "  + result.body_bg + " }";
      styles += "p { color: "  + result.text_color + " }";

      // headings
      styles += "h1, h2, h3, h4, h5, h6 { color: "  + result.headings_color + " }";

      // links
      styles += "ion-content a, ion-content a:visited { color: "  + result.link_color + " }";

      styles += "</style>";

      this.styles = this.sanitizer.bypassSecurityTrustHtml( styles );

    } );
    
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
        window.open(data.iablink, data.target, data.options);

      } else if (data.camera && data.camera === 'library' ) {

        if(data.appbuddy === true ) {
          this.appCamera.photoLibrary(true);
        } else {
          this.appCamera.photoLibrary(false);
        }

      } else if (data.camera && data.camera === 'photo') {
        
        if (data.appbuddy === true) {
          this.appCamera.takePicture(true);
        } else {
          this.appCamera.takePicture(false);
        }

      } else if ( data.fblogin ) {

        this.fbconnect.login();

      }

    }, false); // end eventListener

  }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    if (page.url) {
      this.nav.setRoot(Iframe, page);
    } else {
      this.nav.setRoot(page.component);
    }
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

ionicBootstrap(MyApp, [Menus, Posts, AppCamera, Styles, GlobalVars, AppAds, FbConnect], {
  tabbarPlacement: 'bottom',
  // http://ionicframework.com/docs/v2/api/config/Config/
})