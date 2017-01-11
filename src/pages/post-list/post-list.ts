import {NavController, NavParams, LoadingController, ToastController, ItemSliding} from 'ionic-angular';
import {Component} from '@angular/core';
import {Posts} from '../../providers/posts/posts';
import {PostDetailsPage} from '../post-details/post-details';
import {GlobalVars} from '../../providers/globalvars/globalvars';
import {Storage} from '@ionic/storage';
import {Device} from 'ionic-native';

@Component({
  templateUrl: 'post-list.html'
})
export class PostList {
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

  constructor(
    public nav: NavController, 
    public navParams: NavParams, 
    public postService: Posts, 
    public globalvars: GlobalVars, 
    public loadingController: LoadingController, 
    public storage: Storage, 
    public toastCtrl: ToastController ) {

    this.route = navParams.data.list_route;

    this.title = navParams.data.title;

    if( navParams.data.favorites && navParams.data.favorites === "true" ) {
      this.doFavorites = true;
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

    this.loadPosts( this.route );

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

  itemTapped(event, item) {
    this.nav.push(PostDetailsPage, {
      item: item
    });
  }

  doRefresh(refresh) {
    this.loadPosts( this.route );
    this.loadSlides( this.navParams.data.slide_route );
    // refresh.complete should happen when posts are loaded, not timeout
    setTimeout( ()=> refresh.complete(), 500);
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

      for (var i = length - 1; i >= 0; i--) {
        this.items.push( items[i] );
      }

      this.storage.set( this.route.substr(-10, 10) + '_posts', this.items);

      if(infiniteScroll)
        infiniteScroll.complete();
    });
  }

  addFav(slidingItem: ItemSliding, item) {

    var inArray = false;

    for (let i = this.favorites.length - 1; i >= 0; i--) {

      if( this.favorites[i].id === item.id ) {
        var inArray = true;
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

    if( Device.platform != 'iOS' && Device.platform != 'Android' && url.indexOf('http://') >= 0 ) {
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
}