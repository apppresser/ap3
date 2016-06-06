import {ViewChild} from '@angular/core';
import {App, Platform, MenuController, Nav} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {HelloIonicPage} from './pages/hello-ionic/hello-ionic';
import {NewPage} from './pages/new-page/new-page';
import {ListPage} from './pages/list/list';
import Iframe from './pages/iframe';
import {Menus} from './providers/menus/menus';
// import {Push} from 'ionic-native';


@App({
  templateUrl: 'build/app.html',
  providers: [Menus],
  config: {
    iconMode: 'ios',
    pageTransition: 'ios',
  } // http://ionicframework.com/docs/v2/api/config/Config/
})
class MyApp {
  @ViewChild(Nav) nav: Nav;

  // make HelloIonicPage the root (or first) page
  rootPage: any = HelloIonicPage;
  pages: Array<{title: string, src: string, component: any}>;

  constructor(
    private platform: Platform,
    public menuService: Menus,
    private menu: MenuController
  ) {
    this.initializeApp();
    // set our app's pages
    this.loadMenu();
  }

  loadMenu() {
    // any menu imported from WP has to use same component. Other pages can be added manually with different components
    this.pages = this.menuService.load();
     
     // Add pages manually here, can use different components like this...
    let a = { 'title': 'New Page', 'src': '', 'component': NewPage };
    let b = { 'title': 'List Page', 'src': '', 'component': ListPage };

    this.pages.push(a, b);

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();

      // var push = new Ionic.Push({});

      // push.register(function(token) {
      //   // Log out your device token (Save this!)
      //   console.log("Got Token:", token.token);
      // });

    });

    // When WP site loads, attach our click events
    window.addEventListener('message', (e) => {
      console.log('postMessage', e.data);

      // if it's not our json object, return
      if (e.data.indexOf('{') != 0)
        return;

      var data = JSON.parse(e.data);
      console.warn(data);
      if ( data.src ) {
        let page = { title: data.title, component: Iframe, src: data.src };
        this.nav.push(Iframe, page);
      } else if( data.msg ) {
        window.plugins.socialsharing.share(data.msg, null, null, data.link);
      }
    }, false);

  }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    if (page.src) {
      this.nav.setRoot(Iframe, page);
    } else {
      this.nav.setRoot(page.component);
    }
  }

}
