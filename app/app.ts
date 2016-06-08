import {ViewChild} from '@angular/core';
import {Component} from '@angular/core';
import {ionicBootstrap, Platform, MenuController, Nav, Toast} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {HelloIonicPage} from './pages/hello-ionic/hello-ionic';
import {NewPage} from './pages/new-page/new-page';
import {ListPage} from './pages/list/list';
import {PostList} from './pages/post-list/post-list';
import Iframe from './pages/iframe';
import {Menus} from './providers/menus/menus';
import {Posts} from './providers/posts/posts';
import {TabsPage} from './pages/tabs/tabs';
// import {Push} from 'ionic-native';

/** Make sure to put any providers into the brackets in ionicBootstrap below or they won't work **/

@Component({
  templateUrl: 'build/app.html',
})

class MyApp {
  @ViewChild(Nav) nav: Nav;

  // make HelloIonicPage the root (or first) page
  rootPage: any = HelloIonicPage;
  pages: Array<{title: string, url: string, component: any}>;

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
    this.menuService.load().then( pages => {
      // Loads menu from WordPress API
      this.pages = pages;

      this.pages.unshift({ 'title': 'Local Home', 'url': '', 'component': HelloIonicPage });

      // Add pages manually here, can use different components like this...
      let a = { 'title': 'Tabs', 'url': '', 'component': TabsPage };
      let b = { 'title': 'WP Posts', 'url': '', 'component': PostList };
      let c = { 'title': 'Local Posts', 'url': '', 'component': ListPage };

      this.pages.push(a, b, c);

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
      //   console.log("Got Token:", token.token);
      // });

      
      this.presentToast();


    });

    // When WP site loads, attach our click events
    window.addEventListener('message', (e) => {

      console.log('postMessage', e.data);

      if( e.data === 'site_loaded' ) {

        var iframedoc = document.getElementById('ap3-iframe').contentWindow.document;

        // TODO: can't find elements this way, not sure why
        var shareBtns = iframedoc.getElementsByClassName("appshare");

        console.warn(shareBtns);

        // Add click events to all appshare buttons
        for (var i = 0; i < shareBtns.length; i++) {
          shareBtns[i].addEventListener('click', () => {
            alert('click');
          }, false);
        }
      }

      // if it's not our json object, return
      if (e.data.indexOf('{') != 0)
        return;

      var data = JSON.parse(e.data);

      if ( data.url ) {
        let page = { title: data.title, component: Iframe, url: data.url };
        this.nav.push(Iframe, page);
      } else if( data.msg ) {
        window.plugins.socialsharing.share(data.msg, null, null, data.link);
      }
    }, false);

  }

  presentToast() {
      let toast = Toast.create({
      message: 'This is a toast message',
      duration: 3000
      });

      toast.onDismiss(() => {
      console.log('Dismissed toast');
      });

      this.nav.present(toast);
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

ionicBootstrap(MyApp, [Menus, Posts], {
  tabbarPlacement: 'bottom',
  // http://ionicframework.com/docs/v2/api/config/Config/
})