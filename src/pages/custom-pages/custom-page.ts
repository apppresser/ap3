import {Component, Renderer, ElementRef, OnInit, Input} from '@angular/core';
import {Nav, NavParams, ModalController, Platform, ViewController, Events, IonicPage} from 'ionic-angular';
import {TranslateService, TranslateModule} from '@ngx-translate/core';
import {Storage} from '@ionic/storage';

import {IonicModule, ToastController} from 'ionic-angular';
import {HeaderLogo} from '../../providers/header-logo/header-logo';
import {GlobalVars} from '../../providers/globalvars/globalvars';


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
import {IComponentInputData} from 'angular2-dynamic-component/index';

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

@IonicPage({
  priority: 'high'
})
@Component({
  templateUrl: "custom-page.html"
})
export class CustomPage implements OnInit {

	pagetitle: string;
	listenFunc: Function;
	rtlBack: boolean = false;
	language: any;
	templateUrl: string;
	extraModules = [IonicModule, TranslateModule];
	langs: any;
	segments: any;
	show_segments: boolean = false;
	login_modal: any;
	slug: string;
	header_logo_url: string;
	show_header_logo: boolean = false;
	customClasses: string;
	pages: any;
	menus: {
		side: any,
		tabs: any
	};

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
		private globalvars: GlobalVars,
		private headerLogoService: HeaderLogo
        ) {
		this.pagetitle = navParams.data.title;

		if(navParams.data.is_home == true) {
			this.doLogo()
		}

		// kill vids on android
		if( platform.is('android') ) {
			this.killVideos()
		}

		this.pages = this.getPages(); // not just pages: this is the whole myappp data
		this.menus = {
			side: this.getSideMenu(),
			tabs: this.getTabs()
		};
		this.segments = this.getSegments();
	}

	/** Development mode only -- START */
	inputData: IComponentInputData = {
		// anything that the template needs access to goes here
		pages: this.getPages(),
		segments: this.getSegments(),
		pushPage: (page) => {
			this.pushPage(page);
		},
		openPage: ( page ) => {
			this.openPage(page);
		},
		back: () => {
			this.back();
		},
		mediaModal: ( src, img = null ) => {
			this.mediaModal(src, img);
		},
		updateData: () => {
			this.updateData();
		},
		changeRTL: ( event, rtl ) => {
			this.changeRTL(event, rtl);
		},
		showSegments: () => {
			this.showSegments();
		},
		showLanguages: () => {
			this.showLanguages();
		},
		loginModal: () => {
			this.loginModal();
		}
	}
	/** Development mode only -- END */

	ngOnInit() {

		let slug = this.navParams.data.slug;
		this.slug = slug;

		/** Development mode only -- START */
		// this.templateUrl = 'custom.html'
		this.templateUrl = 'build/' + slug + '.html?' + this.random(1, 999);
		/** Development mode only -- END */

		this.customClasses = 'custom-page page-' + this.slug

		this.listener();

	}

	ionViewWillEnter() {

        if( this.platform.isRTL && this.viewCtrl.enableBack() ) {
            this.viewCtrl.showBackButton(false)
            this.rtlBack = true
        }

    }

	listener() {
		// Listen for link clicks, open in in app browser
	    this.listenFunc = this.renderer.listen(this.elementRef.nativeElement, 'click', (event) => {
	    	
	    	if( event.target.href && event.target.href.indexOf('http') >= 0 ) {
				event.preventDefault();
				if(event.target.target && event.target.target) {
					window.open( event.target.href, event.target.target);
				} else {
					window.open( event.target.href, '_blank' );
				}
	      }
	    });
	}

	// changes the back button transition direction if app is RTL
	backRtlTransition() {
		let obj = {}

		if( this.platform.is('ios') )
		  obj = {direction: 'forward'}

		this.nav.pop( obj )
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

		    if( /youtube|wistia|vimeo/.test(frames[i].src) ) {
		       Vidsrc = frames[i].src;
		       frames[i].src = '';
		       setTimeout( function() {
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
		this.headerLogoService.checkLogo().then( data => {
			this.show_header_logo = true
			this.header_logo_url = (<string>data)
		}).catch( e => {
			// no logo, do nothing
            //console.log(e)
		})
	}

	/**
	 * Get side menu index by page slug
	 */
	getMenuIndexBySlug(slug: string) {
		return this.getIndexBySlug(slug, this.menus.side);
	}

	/**
	 * Get tab menu index by page slug
	 * @param slug page slug
	 */
	getTabIndexBySlug(slug: string) {
		return this.getIndexBySlug(slug, this.menus.tabs);
	}

	/**
	 * Side or tab menus
	 * @param slug page slug
	 * @param pages menu or tab pages
	 */
	getIndexBySlug(slug: string, pages) {
		let menu_index: number;
		let count: number = 0;

		if(!pages)
			return menu_index;

		for(let page of pages) {
			if(page.slug && page.slug == slug) {
				menu_index = count;
			}
			count++;
		};

		if(!menu_index && menu_index !== 0)
			console.log(pages); // you can find the slugs here

    	return menu_index;
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
		this.translate.get('Page not found').subscribe( text => {
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

			if( page.target === '_blank' && page.extra_classes.indexOf('system') >= 0 ) {
		      window.open( page.url, '_system', null );
		      return;
		    } else if( page.target === '_blank' ) {
		      window.open( page.url, page.target, null );
		      return;
		    }

		    let opt = {};

		    if( this.platform.isRTL && this.platform.is('ios') )
		      opt = { direction: 'back' }

			if( page.type === 'apppages' && page.page_type === 'list' ) {
				this.nav.push( 'PostList', page, opt );
			} else if( page.type === 'apppages' ) {
				this.nav.push(this.getPageModuleName(page.page_id), page, opt );
			} else if (page.url) {
				this.nav.push('Iframe', page, opt);
			} else {
				this.nav.push(page.component, page.navparams, opt);
			}
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

		if( page.target === '_blank' && page.extra_classes.indexOf('system') >= 0 ) {
			window.open( page.url, '_system', null );
			return;
		} else if( page.target === '_blank' ) {
			window.open( page.url, page.target, null );
			return;
		}

		if( page.type === 'apppages' && page.page_type === 'list' ) {
			this.nav.setRoot( 'PostList', page );
		} else if( page.type === 'apppages' ) {
			this.nav.setRoot(this.getPageModuleName(page.page_id), page );
		} else if (page.url) {
			this.nav.setRoot('Iframe', page);
		} else {
			this.nav.setRoot(page.component, page.navparams);
		}
	}

	back() {
		this.nav.pop();
	}

	mediaModal( src, img = null ) {
		let modal = this.modalCtrl.create('MediaPlayer', {source: src, image: img});
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
		} else {
			this.platform.setDir('ltr', true)
		}
		this.storage.set( 'is_rtl', rtl )
	}

	showSegments() {
		let modal = this.modalCtrl.create('PushSettings');
		modal.present();
	}

	showLanguages() {
		let modal = this.modalCtrl.create('LanguageSettings');
		modal.present();
	}

	loginModal() {
		this.login_modal = this.modalCtrl.create( 'LoginModal' );
		this.login_modal.present();
	}

	getPages() {
		if(!this.pages) {
			this.pages = JSON.parse( window.localStorage.getItem( 'myappp' ) );
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
		return myappp.menus.items;
	}

	getTabs() {
		let myappp = JSON.parse( window.localStorage.getItem( 'myappp' ) );
		return myappp.tab_menu.items;
	}

	getPageModuleName(page_id) {
		if(this.globalvars.isInProductionMode)
			return 'Page'+page_id;
		else
			return 'CustomPage';
	}

}