import { Component, Input, ViewChild } from '@angular/core';
import {Posts} from '../../providers/posts/posts';
import {NavController, NavParams, ToastController, ItemSliding, Slides, ViewController, IonicPage, Platform, Events} from 'ionic-angular';

import {Storage} from '@ionic/storage';
import {Network} from '@ionic-native/network';
import { TranslateService } from '@ngx-translate/core';

import {Iframe} from "../../pages/iframe/iframe";

/**
 * For reference: https://github.com/ionic-team/ionic/blob/master/core/src/components/slides/slides.tsx
 */
@Component({
  selector: 'ap-slider',
  templateUrl: 'ap-slider.html'
})
export class ApSliderComponent {

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
	@Input() card: boolean = false;

	items: any;
	loading: any;
	networkState: string;

	constructor(
		public nav: NavController, 
	    public navParams: NavParams, 
	    public postService: Posts, 
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

		if( this.route ) {

			this.networkState = this.network.type;

		    if( this.networkState === 'none' || this.networkState === 'unknown' ) {
		      // if offline, get posts from storage
		      this.getStoredPosts();
		    } else {
		      this.loadPosts();
		    }

		}

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

		// any menu imported from WP has to use same component. Other pages can be added manually with different components
		this.postService.load( this.route, '1' ).then(items => {

			// Loads posts from WordPress API
			this.items = items;

			this.storage.set( this.route.substr(-10, 10) + '_slides', items);

			// this is not working
			if( this.pager === "false" ) {
				this.slides.pager = false;
			} else {
				this.slides.pager = true;
			}

		}).catch((err) => {

		  console.error('Error getting posts', err);
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

		this.nav.push('PostDetailsPage', {
		  item: item
		}, opt);

	}

	truncateString( string ) {
		return string.substring(0,50);
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