import {Component, Renderer, ElementRef, OnInit, AfterViewInit, Input, isDevMode, OnDestroy, NgZone} from '@angular/core';
import {Nav, NavParams, ModalController, Platform, ViewController, Events, IonicPage, LoadingController, Loading} from 'ionic-angular';
import {TranslateService, TranslateModule} from '@ngx-translate/core';
import {Storage} from '@ionic/storage';
import {Network} from '@ionic-native/network';
import {IonicModule, ToastController} from 'ionic-angular';
import {HeaderLogo} from '../../providers/header-logo/header-logo';
import {Posts} from '../../providers/posts/posts';
import {GlobalVars} from '../../providers/globalvars/globalvars';
import {MenuService} from "../../providers/menus/menu.service";
import {IAP} from '../../providers/inapppurchase/inapppurchase';
import {AnalyticsService} from '../../providers/analytics/analytics.service';

import {Iframe} from "../iframe/iframe";

/**
 * Any changes done to this file needs to be copied over to
 * mkpages/templates/custom-html-template/ for the production
 * script.
 * 
 * When copying over code take care not to include sections
 * marked as "Development mode only"
 * 
 */

/** Development mode only -- START */
import { IComponentInputData } from 'angular2-dynamic-component/index';
import { User } from '../../models/user.model';
import { LoginService } from '../../providers/logins/login.service';
import { ApListComponentModule } from '../../components/ap-list/ap-list.module';
import { ApSliderComponentModule } from '../../components/ap-slider/ap-slider.module';
import { NetworkStatusService } from '../../providers/network/network-status.service';

/*
 * Uses dynamic component creation, see https://github.com/apoterenko/angular2-dynamic-component
 */
class DynamicContext {
  value: string;
  pages: any;
  tab_menu_items: any;

  constructor(){
  }

  onChange() {
    //console.log(this.value)
  }

}
/** Development mode only -- END */

/**
 * Customizable options for our
 * segments, media, language and login modals
 */
class ModalOptions {
	public cssClass?: string;
	public title?: string;
}

@IonicPage({
  priority: 'high'
})
@Component({
  templateUrl: "custom-page.html"
})
export class CustomPage implements OnInit, OnDestroy {

	pagetitle: string;
	user: User;
	subscriptions = [];
	listenFunc: Function;
	rtlBack: boolean = false;
	isRTL: boolean = false;
	language: any;
	templateUrl: string;
	extraModules = [IonicModule, TranslateModule, ApListComponentModule, ApSliderComponentModule];
	langs: any;
	segments: any;
	show_segments: boolean = false;
	login_modal: any;
	login_modal_open = false;
	slug: string;
	header_logo_url: string;
	show_header_logo: boolean = false;
	customClasses: string;
	customHeaderClasses: string;
	pages: any;
	products: any;
	spinner: Loading;
	menus: {
		side: any,
		tabs: any
	};
	route: string;
	page: number = 1;
	items: any;
	networkState: any;
	use_dynamic: boolean = false;
	isOffline: boolean;
	isOnline: boolean;

	constructor(
		public navParams: NavParams,
		public nav: Nav,
		public modalCtrl: ModalController,
		public renderer: Renderer,
		public elementRef: ElementRef,
		public viewCtrl: ViewController,
		private platform: Platform,
		public translate: TranslateService,
		public storage: Storage,
		public events: Events,
		public toastCtrl: ToastController,
		private headerLogoService: HeaderLogo,
		public loginservice: LoginService,
		public iap: IAP,
		public loadingCtrl: LoadingController,
		public postCtrl: Posts,
		public globalvars: GlobalVars,
		private menuservice: MenuService,
		private networkstatus: NetworkStatusService,
		private zone: NgZone,
		private analyticsservice: AnalyticsService,
		private network: Network
        ) {}

	ngOnInit() {

		this.use_dynamic = this.globalvars.getUseDynamicPageModule();

		// Initial user settings
		this.user = this.loginservice.user;
		this.inputData.user = this.loginservice.user;

		// Updates to user settings
		this.subscriptions.push(this.loginservice.loginStatus().subscribe(user => {
			this.user = user
			/** Development mode only -- START */
			this.inputData.user = user;
			/** Development mode only -- END */
		}));

		this.initNetworkStatus();

		this.pagetitle = this.navParams.data.title;
		this.initIsRTL();

		if(this.navParams.data.is_home == true) {
			this.doLogo()
		}

		// kill vids on android
		if(this.platform.is('android')) {
			this.killVideos()
		}

		this.pages = this.getPages(); // not just pages: this is the whole myappp data
		this.menus = {
			side: this.getSideMenu(),
			tabs: this.getTabs()
		};
		this.segments = this.getSegments();

		let slug = this.navParams.data.slug;
		this.slug = slug;

		/** Development mode only -- START */
		// this.templateUrl = 'custom.html'
		this.templateUrl = 'build/' + slug + '.html?' + this.random(1, 999);
		/** Development mode only -- END */

		this.customClasses = 'custom-page page-' + this.slug
		this.customHeaderClasses = 'header-' + this.slug

		this.listener();


	}

	ionViewWillEnter() {

		if(this.slug) {
			this.analyticsservice.trackScreenView('CustomPage', this.slug);
		}

        if(this.platform.isRTL && this.viewCtrl.enableBack()) {
            this.viewCtrl.showBackButton(false)
            this.rtlBack = true
        }

    }

	listener() {
		// Listen for link clicks, open in in app browser
	    this.listenFunc = this.renderer.listen(this.elementRef.nativeElement, 'click', (event) => {

	    	if(event.target.href && event.target.href.indexOf('http') >= 0) {
				event.preventDefault();
				if(event.target.target && event.target.target) {
					window.open(event.target.href, event.target.target);
				} else {
					window.open(event.target.href, '_blank');
				}
	      }
	    });
	}

	// changes the back button transition direction if app is RTL
	backRtlTransition() {
		let obj = {}

		if(this.platform.is('ios'))
		  obj = {direction: 'forward'}

		this.nav.pop(obj)
	}

	presentToast(msg) {

	    let toast = this.toastCtrl.create({
	      message: msg,
	      duration: 5000,
	      position: 'bottom'
	    });

	    toast.present();

	}

	// stop videos from playing when app is exited, required by Google
	killVideos() {

		this.platform.pause.subscribe(() => {

		  let frames = this.elementRef.nativeElement.getElementsByTagName('iframe')

		  let Vidsrc

		  for (let i in frames) {

		    if(/youtube|wistia|vimeo/.test(frames[i].src)) {
		       Vidsrc = frames[i].src;
		       frames[i].src = '';
		       setTimeout(function() {
		           frames[i].src = Vidsrc;
		       }, 500);
		    }

		  }

		})

	}

	random(min, max) {
		if (min == null && max == null) {
			max = 1;
		}
		min = +min || 0;
		if (max == null) {
			max = min;
			min = 0;
		}
		return min + Math.floor(Math.random() * ((+max || 0) - min + 1));
	}

	doLogo() {
		// check if logo file exists. If so, show it
		this.headerLogoService.checkLogo().then(data => {
			this.show_header_logo = true
			this.header_logo_url = (<string>data)
		}).catch(e => {
			// no logo, do nothing
            //console.log(e)
		})
	}

	/**
	 * Get side menu index by page slug
	 */
	getMenuIndexBySlug(slug: string) {
		return this.menuservice.getIndexBySlug(slug, this.menus.side);
	}

	/**
	 * Get tab menu index by page slug
	 * @param slug page slug
	 */
	getTabIndexBySlug(slug: string) {
		return this.menuservice.getIndexBySlug(slug, this.menus.tabs);
	}

	/**
	 * Search both menus for a page
	 * 
	 * @param page_slug
	 */
	getPage(page_slug: string) {

		let menu_index: number;
		let page: object;

		menu_index = this.getMenuIndexBySlug(page_slug);

		if(menu_index || menu_index === 0) {
			return this.menus.side[menu_index];
		}

		menu_index = this.getTabIndexBySlug(page_slug);

		if(menu_index || menu_index === 0) {
			return this.menus.tabs[menu_index];
		}

		// otherwise . . .
		this.translate.get('Page not found').subscribe(text => {
			this.presentToast(text);
		});

		return false;
	}

	/**
	 * Adds a view on top of root view (w/ backbutton)
	 * 
	 * @param page 
	 */
	pushPage(page) {

		if(typeof page === 'string') {
			page = this.getPage(page);
			if(page === false)
				return;
		}

		if(page && page.extra_classes && this.yieldLogin(page.extra_classes))
			return;

		if(page && page.extra_classes && (page.extra_classes.indexOf('loginmodal') >= 0 || page.extra_classes.indexOf('logoutmodal') >= 0)) {
			this.loginModal({title:page.title});
			return;
		}

		if(page.target === '_blank' && page.extra_classes.indexOf('system') >= 0) {
	      window.open(page.url, '_system', null);
	      return;
	    } else if(page.target === '_blank') {
	      window.open(page.url, page.target, null);
	      return;
	    }

	    let opt = {};

	    if( this.platform.isRTL && this.platform.is('ios') )
	      opt = { direction: 'back' }

	  	let root = this.getPageType( page );

		this.nav.push( root, page, opt );

	}

	/**
	 * Set a root view
	 * 
	 * @param page 
	 */
	openPage(page) {

		if(typeof page === 'string') {
			page = this.getPage(page);
			if(page === false)
				return;
		}

		if(page && page.extra_classes && this.yieldLogin(page.extra_classes))
			return;

		if(page && page.extra_classes && (page.extra_classes.indexOf('loginmodal') >= 0 || page.extra_classes.indexOf('logoutmodal') >= 0)) {
			this.loginModal({title:page.title});
			return;
		}

		if( page.extra_classes && page.extra_classes.indexOf('desktoptheme') >= 0 ) {
			let url = new URL(page.url);
			url.searchParams.append('appp_bypass', 'true');
			let iab: any = window.open(url.toString(), '_blank');
			return;
		} else if( page.target === '_blank' && page.extra_classes && page.extra_classes.indexOf('system') >= 0 ) {
			window.open( page.url, '_system', null );
			return;
		} else if( page.target === '_blank' ) {
			window.open( page.url, page.target, null );
			return;
		}

		let root = this.getPageType( page );

		this.nav.setRoot( root, page );
	}

	back() {
		this.nav.pop();
	}

	mediaModal( src, img = null, opt?: ModalOptions ) {

		const css = (opt && opt.cssClass) ? opt.cssClass : '';
		const params: {source, image, title?} = {source: src, image: img};

		if(opt && opt.title) {
			params.title = opt.title;
		}

		let modal = this.modalCtrl.create('MediaPlayer', params, {
			cssClass: css
		});
		modal.present();
	}

	updateData() {
		window.localStorage.removeItem( 'myappp' )
		this.storage.remove('segments')
		this.events.publish( 'data:update', true )
	}

	changeRTL( event, rtl ) {
		if( rtl ) {	
			this.platform.setDir('rtl', true)
			this.isRTL = true;
		} else {
			this.platform.setDir('ltr', true)
			this.isRTL = false;
		}
		this.storage.set( 'is_rtl', rtl )
	}

	initIsRTL() {
		this.storage.get('is_rtl').then(value => {
			this.isRTL = (value === 'true');
		});
	}

	showSegments(opt?: ModalOptions) {

		const css = (opt && opt.cssClass) ? opt.cssClass : '';
		const params = (opt && opt.title) ? {title: opt.title} : {};

		let modal = this.modalCtrl.create('PushSettings', params, {
			cssClass: css
		});
		modal.present();
	}

	showDownloads(opt?: ModalOptions) {

		const css = (opt && opt.cssClass) ? opt.cssClass : '';
		const params = (opt && opt.title) ? {title: opt.title} : {};

		let modal = this.modalCtrl.create('DownloadList', params, {
			cssClass: css
		});
		modal.present();
	}

	showLanguages(opt?: ModalOptions) {

		const css = (opt && opt.cssClass) ? opt.cssClass : '';
		const params = (opt && opt.title) ? {title: opt.title} : {};

		let modal = this.modalCtrl.create('LanguageSettings', params, {
			cssClass: css
		});
		modal.present();
	}

	loginModal(opt?: ModalOptions) {

		const css = (opt && opt.cssClass) ? opt.cssClass : '';
		const params = (opt && opt.title) ? {title: opt.title} : {};

		this.login_modal = this.modalCtrl.create('LoginModal', params, {
			cssClass: css
		});

		this.login_modal.onDidDismiss(data => {
			this.login_modal_open = false;
		});

		if( this.login_modal_open === false) {
			this.login_modal_open = true;
			this.login_modal.present();
		}
	}

	/**
   * Open the login modal if the menu item's extra_classes contains 'yieldlogin'
   * @param extra_classes 
   */
	yieldLogin(extra_classes) {

		if(extra_classes && extra_classes.indexOf('yieldlogin') >= 0) {
		  if(this.user) { // logged in
		    return false;
		  } else { // logged out, show login modal
		    this.loginModal();
		    return true;
		  }
		}

		return false;
	}

	getPages() {

		if(!this.pages) {

			let data = JSON.parse( window.localStorage.getItem( 'myappp' ) );

			this.pages = data;

			let menu = [];

			// remove dividers
			if(data && data.menus && data.menus.items) {
				for(let page of data.menus.items) {
					if(page.extra_classes && page.extra_classes.indexOf('divider') >= 0) {
						// skip
						// console.log('skip', page)
					} else {
						menu.push(page);
					}
				}
				this.pages.menus.items = menu.slice();
			}
		}

		return this.pages;
	}

	getSegments() {
		if(!this.segments)
			this.segments = JSON.parse( window.localStorage.getItem( 'segments' ) );
		return this.segments;
	}

	getSideMenu() {
		let myappp = JSON.parse( window.localStorage.getItem( 'myappp' ) );
		if(myappp && myappp.menus && myappp.menus.items)
			return myappp.menus.items;
		else
			return [];
	}

	getTabs() {
		let myappp = JSON.parse( window.localStorage.getItem( 'myappp' ) );
		if(myappp && myappp.tab_menu && myappp.tab_menu.items)
			return myappp.tab_menu.items;
		else
			return [];
	}

	getPageModuleName(page_id) {
		if(!isDevMode())
			return 'Page'+page_id;
		else
			return 'CustomPage';
	}

	// duplicate in app.component.ts if any updates are made
	getPageType( page ) {

		if( page.type === 'apppages' && page.page_type === 'list' ) {
		  return 'PostList';
		} else if( page.type === 'apppages' && page.page_type === 'media-list' ) {
		  return 'MediaList';
		} else if( page.type === 'apppages' && page.page_type === 'bp-list' ) {

			// maybe load profile page. It has type of bp-list even though it's not a bp-list page. Awkward I know.
			if( page.list_route === 'profile' ) {
				return 'BpProfilePage';
			} else {
				return 'BpList';
			}

		} else if( page.type === 'apppages' ) {
		  return this.getPageModuleName(page.page_id);
		} else if( page.url && page.type === 'custom' && !page.root ) {
		  return Iframe;
		} else {
		  return null;
		}

	}

	buyProduct( id ) {
		this.iap.buy( id );
	}

	subscribeNoAds( id ) {

		this.showSpinner();

		this.iap.subscribeNoAds( id );

		// TODO: convert this to promise, get rid of timeout
		setTimeout(() => {
		    this.hideSpinner();
		  }, 3000);
	}

	restoreNoAds( id ) {
		this.showSpinner();
		this.iap.restoreNoAds( id ).then( res => {
			console.log(res)
			this.hideSpinner();
		});
	}

	showSpinner() {
		if(!this.spinner) {
			this.spinner = this.loadingCtrl.create();
			this.spinner.present();
		}
	}

	hideSpinner() {
		this.spinner.dismiss().then(()=>{
			this.spinner = null;
		})
	}

	ngOnDestroy() {
		this.subscriptions.forEach(subscription => {
			subscription.unsubscribe();
		});
	}

	initNetworkStatus() {

		this.isOffline = !this.networkstatus.currentStatus;
		this.isOnline  = this.networkstatus.currentStatus;

		/** Development mode only -- START */
		this.inputData.isOffline = !this.networkstatus.currentStatus;
		this.inputData.isOnline  = this.networkstatus.currentStatus;
		/** Development mode only -- END */

		this.subscriptions.push(this.networkstatus.networkStatus().subscribe(status => {

			// console.log('custom-page network status', status);

			this.isOffline = !status;
			this.isOnline  = status;

			/** Development mode only -- START */
			this.zone.run( () => {
				this.inputData.isOffline = !status;
				this.inputData.isOnline  = status;
			});
			/** Development mode only -- END */
		}));
	}

	/** Development mode only -- START */
	inputData: IComponentInputData = {
		// anything that the template needs access to goes here
		user: this.loginservice.user,
		pages: this.getPages(),
		segments: this.getSegments(),
		platform: this.platform,
		customClasses: this.customClasses,
		customHeaderClasses: this.customHeaderClasses,
		isOffline: this.isOffline,
		isOnline: this.isOnline,
		pushPage: (page) => {
			this.pushPage(page);
		},
		openPage: ( page ) => {
			this.openPage(page);
		},
		back: () => {
			this.back();
		},
		mediaModal: ( src, img = null, options?: ModalOptions ) => {
			this.mediaModal(src, img, options);
		},
		updateData: () => {
			this.updateData();
		},
		changeRTL: ( event, rtl ) => {
			this.changeRTL(event, rtl);
		},
		showSegments: (options?: ModalOptions) => {
			this.showSegments(options);
		},
		showLanguages: (options?: ModalOptions) => {
			this.showLanguages(options);
		},
		loginModal: (options?: ModalOptions) => {
			this.loginModal(options);
		},
		showDownloads: (options?: ModalOptions) => {
			this.showDownloads(options);
		},
		buyProduct: ( id ) => {
			this.iap.buy( id );
		},
		subscribeNoAds: ( id ) => {
			this.iap.subscribeNoAds( id );
		},
		restoreNoAds: ( id ) => {
			this.iap.restoreNoAds( id );
		}
	}
	/** Development mode only -- END */

}