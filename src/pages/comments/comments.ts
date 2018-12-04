import { Component, isDevMode} from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { WooProvider } from '../../providers/woo/woo';
import {Posts} from '../../providers/posts/posts';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-comments',
  templateUrl: 'comments.html',
})
export class CommentsPage {

	items: any;
	page: number = 1;
	route: string;
	customClasses: string;
	title: string;
	isWooReviews: boolean = false;
	provider: any;

	constructor(
		public navCtrl: NavController, 
		public navParams: NavParams,
		public wooProvider: WooProvider,
		public postProvider: Posts,
		public loadingCtrl: LoadingController,
		public toastCtrl: ToastController,
		public storage: Storage
		) {

		if( this.navParams.get('route') ) {
			this.route = this.navParams.get('route')
		} else {
			return;
		}

		if( this.navParams.get('woo') ) {
			this.isWooReviews = true
		}

		// console.log('route ' + this.route)

		this.title = this.navParams.get('title')

		this.loadItems( this.route )

	}

	loadItems( route ) {

		let loading = this.loadingCtrl.create({
		    showBackdrop: false,
		    //dismissOnPageChange: true
		});

		loading.present(loading);

		this.page = 1;

		if( this.isWooReviews ) {
			this.provider = this.wooProvider
		} else {
			this.provider = this.postProvider
		}

		// any menu imported from WP has to use same component. Other pages can be added manually with different components
		this.provider.get( route, this.page ).then(items => {

			if( (<any>items).length ) {

			  this.items = items;

			  // load more right away
			  this.loadMore(null);

			}

			loading.dismiss();
		  
		}).catch((err) => {

		  loading.dismiss();
		  console.error('Error getting posts', err);

		});

		// make sure spinner never gets stuck on
		setTimeout(() => {
		    loading.dismiss();
		}, 8000);

	}

	doRefresh(refresh) {
		this.loadItems( this.route );
		// refresh.complete should happen when posts are loaded, not timeout
		setTimeout( ()=> refresh.complete(), 500);
	}

	loadMore(infiniteScroll) {

		this.page++;

		this.provider.get( this.route, this.page ).then(items => {
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
		  position: 'bottom',
		  cssClass: 'normal-toast'
		});

		toast.present();

	}

	getPageModuleName(page_id) {
		if(!isDevMode())
			return 'Page'+page_id;
		else
			return 'CustomPage';
	}

	addQueryParam(url, param) {
		const separator = (url.indexOf('?') > 0) ? '&' : '?';
		return url + separator + param;
	}

}