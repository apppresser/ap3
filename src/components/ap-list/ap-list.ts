import { Component, Input, OnInit } from '@angular/core';
import {Posts} from '../../providers/posts/posts';
import {NavController, NavParams, LoadingController, ToastController, ItemSliding, Platform, ViewController, Content, IonicPage} from 'ionic-angular';

import {Storage} from '@ionic/storage';
import {Device} from '@ionic-native/device';
import {Network} from '@ionic-native/network';

/**
 * Generated class for the ApListComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'ap-list',
  templateUrl: 'ap-list.html'
})
export class ApListComponent implements OnInit {

	@Input() route: string;
	@Input() card: boolean = false;
	@Input() favorites: boolean = false;
	@Input() infiniteScroll: boolean = false;

	page: number = 1;
	items: any;
	loading: boolean = false;
	networkState: string;
	favoriteItems: any;

	constructor(
		public nav: NavController, 
	    public navParams: NavParams, 
	    public postService: Posts,
	    public loadingController: LoadingController, 
	    public storage: Storage, 
	    public toastCtrl: ToastController,
	    public viewCtrl: ViewController,
	    public platform: Platform,
	    private network: Network,
	    private Device: Device
		) {

	}

	ngOnInit() {

		if( this.route ) {

			this.networkState = this.network.type;

		    if( this.networkState === 'none' || this.networkState === 'unknown' ) {
		      // if offline, get posts from storage
		      this.getStoredPosts();
		    } else {
		      this.loadPosts();
		    }

		}

	}

	// get posts from storage when we are offline
	getStoredPosts() {

		this.storage.get( this.route.substr(-10, 10) + '_posts' ).then( posts => {
		  if( posts ) {
		    this.items = posts;
		  } else {
		    this.presentToast('No data available, pull to refresh when you are online.');
		  }
		});

	}

	loadPosts() {

		this.loading = true;

		this.page = 1;

		// any menu imported from WP has to use same component. Other pages can be added manually with different components
		this.postService.load( this.route, this.page ).then(items => {

		  // Loads posts from WordPress API
		  this.items = items;

		  this.storage.set( this.route.substr(-10, 10) + '_posts', items);

		  // load more right away
		  if( this.infiniteScroll )
		  	this.loadMore(null);

		  this.loading = false

		}).catch((err) => {

		  this.loading = false

		  console.error('Error getting posts', err);
		  this.presentToast('Error getting posts.');

		});

	}

	loadDetail(item) {

		let opt = {};

		if( this.platform.isRTL && this.platform.is('ios') )
		  opt = { direction: 'back' }

		this.nav.push('PostDetailsPage', {
		  item: item
		}, opt);

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

	// doRefresh(refresh) {
	// 	this.loadPosts();
	// 	setTimeout( ()=> refresh.complete(), 500);
	// }

	addFav(slidingItem: ItemSliding, item) {

		var inArray = false;

		for (let i = this.favoriteItems.length - 1; i >= 0; i--) {

		  if( this.favoriteItems[i].id === item.id ) {
		    inArray = true;
		    break;
		  }
		}

		// Don't add duplicate favs
		if( inArray === false ) {

		  this.favoriteItems.push(item);

		  this.storage.set( this.route.substr(-10, 10) + '_favorites', this.favoriteItems);

		  this.presentToast('Favorite Added');

		} else {

		  for (let i = this.favoriteItems.length - 1; i >= 0; i--) {
		    if( this.favoriteItems[i].id === item.id ) {
		      this.favoriteItems.splice(i, 1);
		      break;
		    }
		  }

		  this.storage.set( this.route.substr(-10, 10) + '_favorites', this.favoriteItems);

		  // refresh the list
		  if( this.favoriteItems.length ) {
		    this.items = this.favoriteItems;
		  } else {
		    this.showAll();
		  }

		  this.presentToast('Favorite Removed');

		}

		slidingItem.close();

	}

	showFavorites() {

		this.storage.get( this.route.substr(-10, 10) + '_favorites' ).then( (favorites) => {

		  if( favorites && favorites.length) {

		    this.favorites = favorites;

		    this.items = favorites;

		  } else {
		    this.presentToast('No Favorites to show');
		  }

		});

	}

	showAll() {
		this.storage.get( this.route.substr(-10, 10) + '_posts' ).then((items) => {
		  this.items = items;
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

}