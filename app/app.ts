import {ViewChild} from '@angular/core';
import {Component} from '@angular/core';
import {ionicBootstrap, Platform, MenuController, Nav, Toast, ActionSheet} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {HelloIonicPage} from './pages/hello-ionic/hello-ionic';
import {NewPage} from './pages/new-page/new-page';
import {ListPage} from './pages/list/list';
import {PostList} from './pages/post-list/post-list';
import Iframe from './pages/iframe';
import {Menus} from './providers/menus/menus';
import {Posts} from './providers/posts/posts';
import {TabsPage} from './pages/tabs/tabs';
import {Camera} from 'ionic-native';
import {Transfer} from 'ionic-native';
// import {Push} from 'ionic-native';

/** Make sure to put any providers into the brackets in ionicBootstrap below or they won't work **/

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

      this.pages.unshift({ 'title': 'Set Cookie', 'url': 'http://reactordev.com/apv2?appp=2', 'component': Iframe });

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

      
      // this.presentToast();
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
        window.plugins.socialsharing.share(data.msg, null, null, data.link);

      } else if (data.iablink) {

        // in app browser links
        window.open(data.iablink, data.target, data.options);

      } else if (data.camera) {

        let options = {
           quality: 30,
           destinationType: Camera.DestinationType.FILE_URI,
           sourceType: window.navigator.camera.PictureSourceType.PHOTOLIBRARY,
           correctOrientation: true,
           targetWidth: 1204,
           targetHeight: 1204
        };

        Camera.getPicture(options).then((imageData) => {
          // imageData is either a base64 encoded string or a file URI
          // If it's base64:
          // let base64Image = "data:image/jpeg;base64," + imageData;
          this.uploadPhoto(imageData);
        }, (err) => {
          alert(err);
        });

      }

    }, false); // end eventListener

  }

  uploadPhoto(imageURI) {

    let fileTransfer = new Transfer();

    let iframedoc = document.getElementById('ap3-iframe').contentWindow.document;
    let iframewin = document.getElementById('ap3-iframe').contentWindow.window;

    // console.log('imageURI', imageURI);

    let image = imageURI.substr(imageURI.lastIndexOf('/') + 1);

    let name = image.split("?")[0];
    let anumber = image.split("?")[1];
    let ajaxurl = iframewin.apppCore.ajaxurl;

    if ('Android' === device.platform ) {
      image = anumber + '.jpg';
    }

    // console.log(image);

    let options = new FileUploadOptions();
    options.fileKey = 'appp_cam_file';
    options.fileName = imageURI ? image : '';
    options.mimeType = 'image/jpeg';

    let params = {};
    let form_fields = [];
    let form_values = [];
    let iterator;
    let form_elements = iframedoc.getElementById('appp_camera_form').elements;

    // console.log(form_elements);

    for (iterator = 0; iterator < form_elements.length; iterator++) {
      form_fields[iterator] = form_elements[iterator].name;
      form_values[iterator] = form_elements[iterator].value;
      // console.log(form_elements[iterator].name, form_elements[iterator].value);
    }

    params.form_fields = JSON.stringify(form_fields);
    params.form_values = JSON.stringify(form_values);
    params.appp_action = 'attach';

    iframedoc.getElementById('appp_cam_post_title').value = '';
    options.params = params;

    fileTransfer.upload(imageURI, ajaxurl, options, true).then( ()=> {
      alert('success'); 
    }).catch( (e)=> {
      console.warn(e);
    });

  }

  presentToast() {
      let toast = Toast.create({
      message: 'This is a toast message',
      duration: 3000
      });

      toast.onDismiss(() => {
      // console.log('Dismissed toast');
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