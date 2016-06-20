/* Framework */
import {ViewChild, Component} from '@angular/core';
import {ionicBootstrap, Platform, MenuController, Nav} from 'ionic-angular';

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

/* Native */
import {StatusBar, SocialSharing} from 'ionic-native';

@Component({
  templateUrl: 'build/app.html',
})

class MyApp {
  @ViewChild(Nav) nav: Nav;

  // make HelloIonicPage the root (or first) page
  rootPage: any = HelloIonicPage;
  pages: Array<{title: string, url: string, component: any, classes: any}>;

  constructor(
    private platform: Platform,
    public menuService: Menus,
    public appCamera: AppCamera,
    private menu: MenuController
  ) {
    this.initializeApp();
    // set our app's pages
    this.loadMenu();
  }

  loadMenu() {
    // any menu imported from WP has to use same component. Other pages can be added manually with different components
    this.menuService.load().then( pages => {
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

      // var push = new Ionic.Push({});

      // push.register(function(token) {
      //   // Log out your device token (Save this!)
      //   // console.log("Got Token:", token.token);
      // });

      this.attachListeners();

    });

  }

  /* 
  * We are listening for postMessage events from the iframe pages. When something needs to happen, a message is sent from the iframe as a JSON object, such as { iablink: 'http://apppresser.com', target: '_blank', options: '' }. We parse that object here, and do the phonegap stuff like window.open(data.iablink)
  */

  attachListeners() {

    // When WP site loads, attach our click events
    window.addEventListener('message', (e) => {

      // console.log('postMessage', e.data);

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

        console.log('appbuddy app.ts', data.appbuddy);

        if(data.appbuddy === true ) {
          this.appCamera.photoLibrary(true);
        } else {
          this.appCamera.photoLibrary(false);
        }

      } else if (data.camera && data.camera === 'photo') {

        console.log('appbuddy app.ts', data.appbuddy);
        
        if (data.appbuddy === true) {
          this.appCamera.takePicture(true);
        } else {
          this.appCamera.takePicture(false);
        }

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

}

// Pass the main app component as the first argument
// Pass any providers for your app in the second argument
// Set any config for your app as the third argument:
// http://ionicframework.com/docs/v2/api/config/Config/

ionicBootstrap(MyApp, [Menus, Posts, AppCamera], {
  tabbarPlacement: 'bottom',
  // http://ionicframework.com/docs/v2/api/config/Config/
})