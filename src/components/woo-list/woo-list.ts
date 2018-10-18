import { Component, Input, OnInit } from '@angular/core';
import { WooProvider } from '../../providers/woo/woo';
import {NavController, NavParams, LoadingController, ToastController, Platform, ViewController, IonicPage, Events} from 'ionic-angular';

import {Storage} from '@ionic/storage';
import {Network} from '@ionic-native/network';
import {TranslateService} from '@ngx-translate/core';

import {Iframe} from "../../pages/iframe/iframe";

@Component({
  selector: 'woo-list',
  templateUrl: 'woo-list.html'
})
export class WooListComponent implements OnInit {

	@Input() route: string;
	@Input() card: boolean = false;
	@Input() infiniteScroll: boolean = false;
	@Input() wp: string;

	page: number = 1;
	items: any;
	loading: boolean = false;
	networkState: string;
	favoriteItems: any;

	constructor(
		public nav: NavController, 
	    public navParams: NavParams, 
	    public wooProvider: WooProvider,
	    public loadingController: LoadingController, 
	    public storage: Storage, 
	    public toastCtrl: ToastController,
	    public viewCtrl: ViewController,
	    public platform: Platform,
		private network: Network,
		private translate: TranslateService,
		public events: Events
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

		this.storage.get( this.route.substr(-10, 10) + '_woo' ).then( posts => {
		  if( posts ) {
		    this.items = posts;
		  } else {
				this.translate.get('No data available, pull to refresh when you are online.').subscribe( text => {
					this.presentToast(text);
				});
		  }
		});

	}

	loadPosts() {

		this.loading = true;

		this.page = 1;

		// any menu imported from WP has to use same component. Other pages can be added manually with different components
		this.wooProvider.get( this.route, this.page ).then(items => {

		  // Loads posts from WordPress API
		  this.items = items;

		  this.storage.set( this.route.substr(-10, 10) + '_woo', items);

		  // load more right away
		  if( this.infiniteScroll )
		  	this.loadMore(null);

		  this.loading = false

		}).catch((err) => {

		  this.loading = false

			console.error('Error getting posts', err);
			this.translate.get('Error getting posts.').subscribe( text => {
				this.presentToast(text);
			});

		});

	}

	loadDetail(item) {

		// this is for learndash
		if( this.wp === "true" ) {

			let newitem: { url:string, title:string } = { url: item.link, title: item.title.rendered };
			let data = JSON.parse( window.localStorage.getItem( 'myappp' ) );

			if( data.tab_menu && data.tab_menu.items ) {
				// push from main component so we don't have nested views
				this.events.publish( 'pushpage', newitem )
			} else {
				this.nav.push(Iframe, newitem );
			}

			return;
		}

		let opt = {};

		if( this.platform.isRTL && this.platform.is('ios') )
		  opt = { direction: 'back' }

		if( item.price ) {
			
			this.nav.push('WooDetail', {
			  item: item
			}, opt);

		} else {

			// link to another category page. Need to be able to tell if a category has children. If so, we link to 'products/categories/?parent=' + item.id 
			// otherwise we link to products?category=item.id
			this.nav.push('WooList', {
			  route: 'products?category=' + item.id
			}, opt);

		}

	}

	loadMore(infiniteScroll) {

		this.page++;

		this.wooProvider.get( this.route, this.page ).then(items => {

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

			this.storage.set( this.route.substr(-10, 10) + '_woo', this.items);

				if(infiniteScroll)
					infiniteScroll.complete();

		}).catch( e => {

			// promise was rejected, usually a 404 or error response from API
			if(infiniteScroll)
				infiniteScroll.complete();

			console.warn(e)

		});

	}

	truncateString( string ) {
		return string.substring(0,100);
	}

	getBgImage( item ) {
		
		if( item.featured_image_urls.large ) {
			return item.featured_image_urls.large;
		} else if( item.featured_image_urls.medium ) {
			return item.featured_image_urls.medium;
		}

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