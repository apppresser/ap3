import { Component, Input, OnInit, HostBinding } from '@angular/core';
import { WooProvider } from '../../providers/woo/woo';
import {NavController, NavParams, LoadingController, ToastController, Platform, ViewController, IonicPage, Events} from 'ionic-angular';

import {Storage} from '@ionic/storage';
import {Network} from '@ionic-native/network';
import {TranslateService} from '@ngx-translate/core';

import {Iframe} from "../../pages/iframe/iframe";

@Component({
  selector: 'woo-list',
  templateUrl: 'woo-list-component.html'
})
export class WooListComponent implements OnInit {

	@Input() route: string;
	@Input() card: boolean = true;
	@Input() infiniteScroll: boolean = false;
	@Input() wp: string;
	@Input() refresh: boolean = false;
	@Input() wishlist: boolean = false;
	@Input() hideToolbar: boolean = false;
	@Input() hideSearch: boolean = false;

	// super confusing way to add a class of "has-toolbar" when there is a toolbar
	@HostBinding('class.has-toolbar') chkToolbar: boolean = true

	page: number = 1;
	items: any;
	loading: boolean = false;
	networkState: string;
	favoriteItems: any;
	categories: any;
	category: any;

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

		if( this.hideToolbar ) {
			// don't add has-toolbar class
			this.chkToolbar = false
		}

		if( this.route ) {

			this.networkState = this.network.type;

		    if( this.networkState === 'none' || this.networkState === 'unknown' ) {
		      // if offline, get posts from storage
		      this.getStoredPosts();
		    } else {
		      this.loadProducts( this.route );
		    }

		    this.getCategories()

		} else if( this.wishlist ) {
			this.getWishlist()
		}

		if( !this.hideSearch ) {
			this.searchIconEvent()
		}

		this.cartIconEvent()

	}

	// this is used to show the cart icon on custom page headers
	cartIconEvent() {
		this.events.publish( 'show_cart_icon', true )
	}

	searchIconEvent() {
		this.events.publish( 'show_search_icon', { route: this.route } )
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

	loadProducts( route ) {

		if( this.wishlist ) {
			this.getWishlist()
			return;
		}

		this.loading = true;

		this.page = 1;

		// any menu imported from WP has to use same component. Other pages can be added manually with different components
		this.wooProvider.get( route, this.page ).then(items => {

		  // Loads posts from WordPress API
		  this.items = items;

		  console.log(items)

		  this.storage.set( this.route.substr(-10, 10) + '_woo', items);

		  // load more right away
		  if( this.infiniteScroll )
		  	this.loadMore(null);

		  this.loading = false

		}).catch((err) => {

		  this.loading = false

		  if( err.error && err.error.message ) {
		  	this.presentToast( err.error.message );
		  } else {
			this.translate.get('Error getting posts.').subscribe( text => {
				this.presentToast(text);
			});

		  }

		  console.error('Error getting posts', err);
			

		});

	}

	getCategories() {

		if( this.route.indexOf('categories') >= 0 ) {
			return;
		}

		this.wooProvider.get( 'products/categories', null ).then(categories => {

			// Loads posts from WordPress API
			this.categories = categories;

			console.log(this.categories)

			// set category name in dropdown
			if( this.route.indexOf('category') >= 0 ) {
				let catId = this.getUrlParam( this.route, 'category=' )
				setTimeout( () => {
					this.category = catId
				}, 100 )
				
			}


		}).catch((err) => {

		  console.warn('Error getting categories', err);

		});

	}

	categoryChanged() {

		let route = this.addQueryParam( 'products', 'category=' + this.category )

		this.loadProducts( route )

		this.items = []

	}

	getWishlist() {

		this.storage.get('woo_saved_items').then( items => {

			if( items && items.length ) {
				this.items = items
			} else {
				this.presentToast('No items to show.')
			}

		})
	}

	removeSavedItem(item) {

		for (let i = this.items.length - 1; i >= 0; i--) {
			if( this.items[i].id === item.id ) {
			  this.items.splice(i, 1);
			  break;
			}
		}

		this.storage.set( 'woo_saved_items', this.items )

	}

	doRefresh( event ) {
		this.loadProducts( this.route )
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

		if( item.type ) {
			
			this.nav.push('WooDetail', {
			  item: item
			}, opt);

		} else if( this.route.indexOf('categories') >= 0 ) {

			this.nav.push('WooList', {
			  route: 'products/categories/?parent=' + item.id
			}, opt);

		} else {

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

	getBtnText( item ) {

		let txt;

		switch( item.type ) {
			case "simple":
				txt = "Add to Cart"
				break;
			case "grouped":
				txt = "View Products"
				break;
			case "variable":
				txt = "Select Options"
				break;
			default:
				txt = "View Details"
		}

		return txt

	}

	productAction( item ) {

		switch( item.type ) {
			case "simple":
				this.addToCart(item)
				break;
			default:
				this.loadDetail(item)
		}

	}

	addToCart( item ) {

		this.presentToast( item.name + ' added to cart.' )

		item.quantity = 1
		item.product_id = item.id

		console.log(item)

		this.wooProvider.addToCart( item ).then( data => {
			
			this.productAddSuccess( data, item )

		}).catch( e => { 

			this.productAddError( e )
			console.warn(e)

		} )

	}

	productAddSuccess( data, item ) {

		this.storage.get( 'cart_count').then( count => {

			if( count ) {
				count = parseInt( count ) + 1
			} else {
				count = 1
			}
			this.storage.set( 'cart_count', count )

			this.events.publish( 'cart_change', count )

		})

	}

	productAddError( e ) {

		let msg;

		if( e.error && e.error.message ) {
			msg = e.error.message
		} else {
			msg = 'There was a problem, your item was not added to the cart.'
		}

		this.presentToast( msg ) 

	}

	truncateString( string ) {
		return string.substring(0,100);
	}

	// get category ID from url string
	getUrlParam( url, param ) {
		console.log('url param ' + url, param)
		return url.split( param ).pop()
	}

	addQueryParam(url, param) {
		const separator = (url.indexOf('?') > 0) ? '&' : '?';
		return url + separator + param;
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

	    // toast.onDidDismiss(() => {
	      
	    // });

	    toast.present();

	}

}