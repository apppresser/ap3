import {NavController, NavParams, LoadingController, ToastController, ItemSliding} from 'ionic-angular';
import {Component} from '@angular/core';
import {Posts} from '../../providers/posts/posts';
import {PostDetailsPage} from '../post-details/post-details';
import {GlobalVars} from '../../providers/globalvars/globalvars';
import {Storage} from '@ionic/storage';

@Component({
  templateUrl: 'post-list.html'
})
export class PostList {
  selectedItem: any;
  icons: string[];
  items: any;
  page: number = 1;
  siteurl: string;
  route: string;
  title: string;
  favorites: any = [];
  doFavorites: boolean = false;

  constructor(public nav: NavController, navParams: NavParams, public postService: Posts, public globalvars: GlobalVars, public loadingController: LoadingController, public storage: Storage, public toastCtrl: ToastController ) {

    this.route = navParams.data.list_route;

    this.title = navParams.data.title;

    if( navParams.data.favorites && navParams.data.favorites === "true" ) {
      this.doFavorites = true;
    }

    console.log( 'favorites' + navParams.data.favorites );
    
  }

  ngOnInit() {

    this.loadPosts( this.route );

  }

  loadPosts( route ) {

    let loading = this.loadingController.create({
        showBackdrop: false,
        dismissOnPageChange: true
    });

    loading.present(loading);

    this.page = 1;
    
    // any menu imported from WP has to use same component. Other pages can be added manually with different components
    this.postService.load( route, this.page ).then(items => {

      console.log('loadPosts: ', items);
      // Loads posts from WordPress API
      this.items = items;

      this.storage.set( route.substr(-10, 10) + '_posts', items);

      // load more right away
      this.loadMore(null);
      loading.dismiss();
    });

  }

  itemTapped(event, item) {
    this.nav.push(PostDetailsPage, {
      item: item
    });
  }

  doRefresh(refresh) {
    this.loadPosts( this.route );
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

      this.storage.set('items', items);

      if(infiniteScroll)
        infiniteScroll.complete();
    });
  }

  addFav(slidingItem: ItemSliding, item) {

    console.log("adding fav", item);

    let inArray = this.favorites.indexOf(item);

    // Don't add duplicate favs
    if( inArray < 0 ) {

      this.favorites.push(item);

      this.storage.set('favorites', this.favorites);

      this.presentToast('Favorite Added');

    } else {

      this.favorites.splice(item, 1);

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
      console.log('Dismissed toast');
    });

    toast.present();

  }

  showFavorites() {

    if(this.favorites.length) {
      this.items = this.favorites;
    } else {
      this.presentToast('No Favorites to show');
    }
  }

  showAll() {
    this.storage.get( this.route.substr(-10, 10) + '_posts' ).then((items) => {
      this.items = items;
    });
  }
}