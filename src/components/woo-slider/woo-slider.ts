import { Component, Input, ViewChild } from '@angular/core';
import { WooProvider } from '../../providers/woo/woo';
import {NavController, NavParams, ToastController, Slides, ViewController, Platform, Events} from 'ionic-angular';

import {Storage} from '@ionic/storage';
import {Network} from '@ionic-native/network';
import { TranslateService } from '@ngx-translate/core';

import {Iframe} from "../../pages/iframe/iframe";

/**
 * For reference: https://github.com/ionic-team/ionic/blob/master/core/src/components/slides/slides.tsx
 */
@Component({
  selector: 'woo-slider',
  templateUrl: 'woo-slider.html'
})
export class WooSliderComponent {

	@ViewChild(Slides) slides: Slides;

	@Input() route: string;
	@Input() pager: string;
	@Input() slidesPerView: string;
	@Input() loop: string;
	@Input() effect: string;
	@Input() paginationType: string;
	@Input() preventClicks: string;
	@Input() freeMode: string;
	@Input() wp: string;
	@Input() spaceBetween: string;

	items: any;
	loading: any;
	networkState: string;

	constructor(
		public nav: NavController, 
	    public navParams: NavParams, 
	    public wooProvider: WooProvider, 
	    public storage: Storage, 
	    public platform: Platform,
	    public toastCtrl: ToastController,
	    public viewCtrl: ViewController,
		private network: Network,
		private translate: TranslateService,
		public events: Events
		) {

	}

	ngAfterViewInit() {

		if( !this.route )
			return;

		this.networkState = this.network.type;

	    if( this.networkState === 'none' || this.networkState === 'unknown' ) {
	      // if offline, get posts from storage
	      this.getStoredPosts();
	    } else {
	      this.loadPosts();
	    }

	    this.cartIconEvent()

		// set options based on input attributes
		if( this.slidesPerView ) {
			this.slides.slidesPerView = this.slidesPerView
		}

		if( this.loop === "true" ) {
			this.slides.loop = true
		}

		if( this.freeMode === "true" ) {
			this.slides.freeMode = true
		}

		if( this.effect ) {
			this.slides.effect = this.effect
		}

		if( this.paginationType ) {
			this.slides.paginationType = this.paginationType
		}

		if( this.spaceBetween ) {
			this.slides.spaceBetween = this.spaceBetween;
		}

	}

	// this is used to show the cart icon on custom page headers
	cartIconEvent() {
		this.events.publish( 'show_cart_icon', true )
	}

	// get posts from storage when we are offline
	getStoredPosts() {

		this.storage.get( this.route.substr(-10, 10) + '_slides' ).then( posts => {
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

		// any menu imported from WP has to use same component. Other pages can be added manually with different components
		this.wooProvider.get( this.route, '1' ).then(items => {

			// Loads posts from WordPress API
			this.items = items;

			console.log(items)

			this.storage.set( this.route.substr(-10, 10) + '_slides', items);

			// this is not working
			if( this.pager === "false" ) {
				this.slides.pager = false;
			} else {
				this.slides.pager = true;
			}

			this.loading = false;

		}).catch((err) => {

			console.error('Error getting posts', err);
			this.loading = false;
			this.translate.get('Error getting posts.').subscribe( text => {
				this.presentToast(text);
			});

		});

	}

	loadDetail(item) {

		if( this.preventClicks === "true" )
			return;

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

			// this is a list of categories, so we need to show category sub-items next
			this.nav.push('WooList', {
			  route: 'products/categories/?parent=' + item.id
			}, opt);

		} else {

			this.nav.push('WooList', {
			  route: 'products?category=' + item.id
			}, opt);

		}

	}

	truncateString( string ) {
		return string.substring(0,50);
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