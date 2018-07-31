import {NavController, NavParams, LoadingController, ToastController, ModalController, Platform, ViewController, Content, IonicPage} from 'ionic-angular';
import {Component, ViewChild, OnInit, Input} from '@angular/core';
import {Posts} from '../../providers/posts/posts';
import {GlobalVars} from '../../providers/globalvars/globalvars';
import {HeaderLogo} from '../../providers/header-logo/header-logo';
import {Storage} from '@ionic/storage';
import {Device} from '@ionic-native/device';
import {Network} from '@ionic-native/network';

@IonicPage()
@Component({
  templateUrl: 'bp-list.html',
  selector: 'bp-list'
})
export class BpList implements OnInit {

  @ViewChild(Content) content: Content;

  selectedItem: any;
  icons: string[];
  items: any;
  page: number = 1;
  siteurl: string;
  route: string;
  title: string;
  rtlBack: boolean = false;
  networkState: any;
  header_logo_url: string;
  show_header_logo: boolean = false;
  customClasses: string = '';

  constructor(
    public nav: NavController, 
    public navParams: NavParams, 
    public postService: Posts, 
    public globalvars: GlobalVars, 
    public loadingController: LoadingController, 
    public storage: Storage, 
    public toastCtrl: ToastController,
    public viewCtrl: ViewController,
    public platform: Platform,
    private headerLogoService: HeaderLogo,
    private Network: Network,
    private Device: Device,
    public modalCtrl: ModalController
  ) {

    this.route = navParams.data.list_route;

    this.title = navParams.data.title;

    this.customClasses = 'post-list' + ((navParams.data.slug) ? ' page-' + navParams.data.slug : '');

    if(navParams.data.is_home == true) {
      this.doLogo()
    }

    this.previewAlert(this.route);
    
  }

  ngOnInit() {

    this.networkState = this.Network.type;

    if( this.networkState === 'none' || this.networkState === 'unknown' ) {
      // if offline, get posts from storage
      this.getStoredPosts();
    } else {
      this.loadPosts( this.route + '?display_comments=false&type=activity_update' );
    }

  }

  ionViewWillEnter() {

    if( this.platform.isRTL && this.viewCtrl.enableBack() ) {
        this.viewCtrl.showBackButton(false)
        this.rtlBack = true
    }
 
  }

  // get posts from storage when we are offline
  getStoredPosts() {

    this.storage.get( this.route.substr(-10, 10) + '_bp' ).then( posts => {
      if( posts ) {
        this.items = posts;
      } else {
        this.presentToast('No data available, pull to refresh when you are online.');
      }
    });

  }

  loadPosts( route ) {

    let loading = this.loadingController.create({
        showBackdrop: false,
        //dismissOnPageChange: true
    });

    loading.present(loading);

    this.page = 1;
    
    // any menu imported from WP has to use same component. Other pages can be added manually with different components
    this.postService.load( route, this.page ).then(items => {

      // Loads posts from WordPress API
      this.items = items;

      this.storage.set( route.substr(-10, 10) + '_bp', items);

      // load more right away
      this.loadMore(null);
      loading.dismiss();
    }).catch((err) => {
      loading.dismiss();
      console.error('Error getting posts', err);
      this.presentToast('Error getting posts.');
    });

    setTimeout(() => {
        loading.dismiss();
    }, 8000);

  }

  loadDetail(item) {

    let opt = {};

    if( this.platform.isRTL && this.platform.is('ios') )
      opt = { direction: 'back' }

    this.nav.push('BpDetailsPage', {
      item: item
    }, opt);
  }

  doRefresh(refresh) {
    this.loadPosts( this.route );
    // refresh.complete should happen when posts are loaded, not timeout
    setTimeout( ()=> refresh.complete(), 500);
  }

  addQueryParam(url, param) {
    const separator = (url.indexOf('?') > 0) ? '&' : '?';
    return url + separator + param;
  }

  loadMore(infiniteScroll) {

    this.page++;

    this.postService.load( this.route, this.page ).then(items => {
      // Loads posts from WordPress API
      let length = items["length"];

      if( length === 0 ) {
        if(infiniteScroll)
          infiniteScroll.complete();
        return;
      }

      for (var i = 0; i < length; ++i) {
        this.items.push( items[i] );
      }

      this.storage.set( this.route.substr(-10, 10) + '_bp', this.items);

      if(infiniteScroll)
        infiniteScroll.complete();

    }).catch( e => {
      // promise was rejected, usually a 404 or error response from API
      if(infiniteScroll)
        infiniteScroll.complete();

      console.warn(e)

    });

  }

  presentToast(msg) {

    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom'
    });

    toast.onDidDismiss(() => {
      // console.log('Dismissed toast');
    });

    toast.present();

  }

  doActivity() {

  	const bpModal = this.modalCtrl.create('BpModal');
  	bpModal.present();

  }

  // Show alert in preview if not using https
  previewAlert(url) {

    if(!url) {
      return;
    }

    if( this.Device.platform != 'iOS' && this.Device.platform != 'Android' && url.indexOf('http://') >= 0 ) {
          alert('Cannot display http pages in browser preview. Please build app for device or use https.');
      }

  }

  // changes the back button transition direction if app is RTL
  backRtlTransition() {
    let obj = {}

    if( this.platform.is('ios') )
      obj = {direction: 'forward'}
    
    this.nav.pop( obj )
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