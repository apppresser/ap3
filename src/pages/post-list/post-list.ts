import {NavController, NavParams, LoadingController, ToastController, ItemSliding, Platform, ViewController, Content, IonicPage} from 'ionic-angular';
import {Component, ViewChild, OnInit, Input} from '@angular/core';
import {Posts} from '../../providers/posts/posts';
import {GlobalVars} from '../../providers/globalvars/globalvars';
import {HeaderLogo} from '../../providers/header-logo/header-logo';
import {Storage} from '@ionic/storage';
import {Device} from '@ionic-native/device';
import {Network} from '@ionic-native/network';
import {AnalyticsService} from '../../providers/analytics/analytics.service';

@IonicPage()
@Component({
  templateUrl: 'post-list.html',
  selector: 'post-list'
})
export class PostList implements OnInit {

  @ViewChild(Content) content: Content;

  selectedItem: any;
  icons: string[];
  items: any;
  slides: any;
  page: number = 1;
  siteurl: string;
  route: string;
  title: string;
  defaultlist: boolean = false
  cardlist: boolean = false;
  favorites: any = [];
  doFavorites: boolean = false;
  showSlider: boolean = false;
  showSearch: boolean = false;
  rtlBack: boolean = false;
  networkState: any;
  header_logo_url: string;
  show_header_logo: boolean = false;
  customClasses: string = '';
  customHeaderClasses: string = '';

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
    private ga: AnalyticsService,
    private Device: Device
  ) {

    this.route = navParams.data.list_route;

    this.title = navParams.data.title;

    this.customClasses = 'post-list' + ((navParams.data.slug) ? ' page-' + navParams.data.slug : '');
    this.customHeaderClasses = (navParams.data.slug) ? ' header-' + navParams.data.slug : '';

    if(navParams.data.is_home == true) {
      this.doLogo()
    }

    if( navParams.data.favorites && navParams.data.favorites === "true" ) {
      this.doFavorites = true;
      this.customClasses += ' has-favorites';
    }

    if( navParams.data.show_slider && navParams.data.show_slider === "true" && navParams.data.slide_route ) {
      this.loadSlides( navParams.data.slide_route );
    }

    if( navParams.data.list_display === 'card' ) {
      this.cardlist = true;
      this.doFavorites = false;
    } else {
      this.defaultlist = true;
    }

    this.previewAlert(this.route);
    
  }

  ngOnInit() {

    this.networkState = this.Network.type;

    if( this.networkState === 'none' || this.networkState === 'unknown' ) {
      // if offline, get posts from storage
      this.getStoredPosts();
    } else {
      this.loadPosts( this.route );
    }

  }

  ionViewWillEnter() {

    if( this.platform.isRTL && this.viewCtrl.enableBack() ) {
        this.viewCtrl.showBackButton(false)
        this.rtlBack = true
    }

    if(this.route) {
      this.storage.get( this.route.substr(-10, 10) + '_favorites' ).then( (favorites) => {
        if( favorites )
          this.favorites = favorites
      });

      this.ga.trackScreenView('PostList', 'route/' + this.route);
    }

 
  }

  // get posts from storage when we are offline
  getStoredPosts() {

    if(this.route) {
      this.storage.get( this.route.substr(-10, 10) + '_posts' ).then( posts => {
        if( posts ) {
          this.items = posts;
        } else {
          this.presentToast('No data available, pull to refresh when you are online.');
        }
      });
    }

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

      this.storage.set( route.substr(-10, 10) + '_posts', items);

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

  itemTapped(event, post) {

    let nav = {
        root: 'PostDetailsPage',
        navParams: {item: post},
        opt: {}
      };

    if( this.platform.isRTL && this.platform.is('ios') )
      nav.opt = { direction: 'back' }

    this.nav.push(nav.root, nav.navParams, nav.opt);
  }

  doRefresh(refresh) {
    this.loadPosts( this.route );
    this.loadSlides( this.navParams.data.slide_route );
    // refresh.complete should happen when posts are loaded, not timeout
    setTimeout( ()=> refresh.complete(), 500);
  }

  toggleSearchBar() {
    if( this.showSearch === true ) {
      this.showSearch = false
    } else {
      this.showSearch = true
    }

    this.content.resize()
  }

  search(ev) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      // set to this.route so infinite scroll works
      this.route = this.addQueryParam(this.navParams.data.list_route, 'search=' + val);
      this.loadPosts( this.route )
    }

  }

  addQueryParam(url, param) {
    const separator = (url.indexOf('?') > 0) ? '&' : '?';
    return url + separator + param;
  }

  clearSearch() {
    // reset to original query
    this.route = this.navParams.data.list_route;
    this.loadPosts(this.route)
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

      this.storage.set( this.route.substr(-10, 10) + '_posts', this.items);

      if(infiniteScroll)
        infiniteScroll.complete();

    }).catch( e => {
      // promise was rejected, usually a 404 or error response from API
      if(infiniteScroll)
        infiniteScroll.complete();

      console.warn(e)

    });

  }

  addFav(slidingItem: ItemSliding, item) {

    var inArray = false;

    for (let i = this.favorites.length - 1; i >= 0; i--) {

      if( this.favorites[i].id === item.id ) {
        inArray = true;
        break;
      }
    }

    // Don't add duplicate favs
    if( inArray === false ) {

      this.favorites.push(item);

      this.storage.set( this.route.substr(-10, 10) + '_favorites', this.favorites);

      this.presentToast('Favorite Added');

    } else {

      for (let i = this.favorites.length - 1; i >= 0; i--) {
        if( this.favorites[i].id === item.id ) {
          this.favorites.splice(i, 1);
          break;
        }
      }

      this.storage.set( this.route.substr(-10, 10) + '_favorites', this.favorites);

      // refresh the list
      if( this.favorites.length ) {
        this.items = this.favorites;
      } else {
        this.showAll();
      }

      this.presentToast('Favorite Removed');

    }

    slidingItem.close();

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

  showFavorites() {

    this.storage.get( this.route.substr(-10, 10) + '_favorites' ).then( (favorites) => {

      if( favorites && favorites.length) {

        this.favorites = favorites;

        this.items = favorites;

        this.showSlider = false;

      } else {
        this.presentToast('No Favorites to show');
      }

    });

  }

  showAll() {
    this.storage.get( this.route.substr(-10, 10) + '_posts' ).then((items) => {
      this.items = items;
    });

    if( this.navParams.data.show_slider && this.navParams.data.show_slider === "true" ) {
      this.showSlider = true;
    }
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

  // get data for slides
  loadSlides( route ) {

    this.postService.load( route , '1' ).then(slides => {

      // Loads posts from WordPress API
      this.slides = slides;
      this.showSlider = true;

    }).catch((err) => {

      this.showSlider = false;
      console.error('Error getting posts', err);

    });

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