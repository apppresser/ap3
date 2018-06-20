import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {Posts} from '../../providers/posts/posts';
import {NavController, NavParams, ToastController, ItemSliding, Slides, ViewController, Content, IonicPage, Platform} from 'ionic-angular';

import {Storage} from '@ionic/storage';
import {Device} from '@ionic-native/device';
import {Network} from '@ionic-native/network';

/**
 * Generated class for the SliderComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'slider-component',
  templateUrl: 'slider.html'
})
export class SliderComponent implements OnInit {

	@ViewChild(Slides) slides: Slides;

	@Input() route: string;

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

		this.storage.get( this.route.substr(-10, 10) + '_slides' ).then( posts => {
		  if( posts ) {
		    this.items = posts;
		  } else {
		    this.presentToast('No data available, pull to refresh when you are online.');
		  }
		});

	}

	loadPosts() {

		// any menu imported from WP has to use same component. Other pages can be added manually with different components
		this.postService.load( this.route, '1' ).then(items => {

		  // Loads posts from WordPress API
		  this.items = items;

		  this.storage.set( this.route.substr(-10, 10) + '_slides', items);

		}).catch((err) => {

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