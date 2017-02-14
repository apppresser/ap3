import {Component, Renderer, ElementRef} from '@angular/core';
import {Iframe} from '../../pages/iframe/iframe';
import {PostList} from '../../pages/post-list/post-list';
import {Nav, NavParams, ModalController, Platform, ViewController, Events} from 'ionic-angular';
import {TranslateService} from 'ng2-translate';
import {Storage} from '@ionic/storage';

import {IonicModule} from 'ionic-angular';

import {IComponentInputData} from 'angular2-dynamic-component/index';

import {MediaPlayer} from '../media-player/media-player';

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

/*
 * Uses dynamic component creation, see https://github.com/apoterenko/angular2-dynamic-component
 */
@Component({
  templateUrl: "custom-page.html"
})
export class CustomPage {

	pagetitle: string;
	listenFunc: Function;
	rtlBack: boolean = false;
	language: any;
	templateUrl: string;
	extraModules = [IonicModule];
	langs: any;

	constructor( 
		public navParams: NavParams, 
		public nav: Nav,
		public modalCtrl: ModalController,
		public renderer: Renderer,
    	public elementRef: ElementRef,
    	public viewCtrl: ViewController,
        public platform: Platform,
        public translate: TranslateService,
        public storage: Storage,
        public events: Events
        ) {
		this.pagetitle = navParams.data.title;
	}

	inputData: IComponentInputData = {
		// anything that the template needs access to goes here
		pages: JSON.parse( window.localStorage.getItem( 'myappp' ) ),
		pushPage: (page) => {

			if( page.target === '_blank' && page.extra_classes.indexOf('system') >= 0 ) {
		      window.open( page.url, '_system', null );
		      return;
		    } else if( page.target === '_blank' ) {
		      window.open( page.url, page.target, null );
		      return;
		    }

		    let opt = {};

		    if( this.platform.isRTL() && this.platform.is('ios') )
		      opt = { direction: 'back' }

			if( page.type === 'apppages' && page.page_type === 'list' ) {
				this.nav.push( PostList, page, opt );
			} else if( page.type === 'apppages' ) {
				this.nav.push( CustomPage, page, opt );
			} else if (page.url) {
				this.nav.push(Iframe, page, opt);
			} else {
				this.nav.push(page.component, page.navparams, opt);
			}
		},
		openPage: ( page ) => {

			if( page.target === '_blank' && page.extra_classes.indexOf('system') >= 0 ) {
		      window.open( page.url, '_system', null );
		      return;
		    } else if( page.target === '_blank' ) {
		      window.open( page.url, page.target, null );
		      return;
		    }

			if( page.type === 'apppages' && page.page_type === 'list' ) {
				this.nav.setRoot( PostList, page );
			} else if( page.type === 'apppages' ) {
				this.nav.setRoot( CustomPage, page );
			} else if (page.url) {
				this.nav.setRoot(Iframe, page);
			} else {
				this.nav.setRoot(page.component, page.navparams);
			}

		},
		mediaModal: ( src, img = null ) => {

			let modal = this.modalCtrl.create(MediaPlayer, {source: src, image: img});
			modal.present();

		},
		changeLang: ( event, lang: string ) => {
			this.translate.use( lang )
			this.storage.set( 'app_language', lang )
		},
		updateData: () => {
			window.localStorage.removeItem( 'myappp' )
			this.events.publish( 'data:update', true )
		},
		changeRTL: ( event, rtl ) => {
			if( rtl ) {	
				this.platform.setDir('rtl', true)
			} else {
				this.platform.setDir('ltr', true)
			}
			this.storage.set( 'is_rtl', rtl )
		},
		// doesn't work, not sure why
		langs: this.getLangs()
	}

	ngOnInit() {
		// console.log(this.navParams);
		// set our custom template url
		let slug = this.navParams.data.slug;
		this.templateUrl = 'build/' + slug + '.html';

		this.listener()

	}

	ionViewWillEnter() {

        if( this.platform.isRTL() && this.viewCtrl.enableBack() ) {
            this.viewCtrl.showBackButton(false)
            this.rtlBack = true
        }

    }

    getLangs() {

    	// Get languages, these are sent from WP site through postMessage in main component
		this.storage.get('site_languages').then( langs => {
			console.log('getlangs', langs)
			if(langs)
				return langs
		})

    }

	listener() {
		// Listen for link clicks, open in in app browser
	    this.listenFunc = this.renderer.listen(this.elementRef.nativeElement, 'click', (event) => {
	      if( event.target.href && event.target.href.indexOf('http') >= 0 ) {
	        event.preventDefault();
	        window.open( event.target.href, '_blank' );
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

}