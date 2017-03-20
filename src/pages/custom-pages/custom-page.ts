import {Component, Renderer, ElementRef} from '@angular/core';
import {Iframe} from '../../pages/iframe/iframe';
import {PostList} from '../../pages/post-list/post-list';
import {Nav, NavParams, ModalController, Platform, ViewController, Events} from 'ionic-angular';
import {TranslateService} from 'ng2-translate';
import {Storage} from '@ionic/storage';

import {IonicModule, ToastController} from 'ionic-angular';

import {IComponentInputData} from 'angular2-dynamic-component/index';

import {MediaPlayer} from '../media-player/media-player';

import {PushSettings} from '../push-settings/push-settings';
import {LanguageSettings} from '../language-settings/language-settings';

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
	segments: any;
	showSegments: boolean = false

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
        public events: Events,
        public toastCtrl: ToastController,
        ) {
		this.pagetitle = navParams.data.title;

		// kill vids on android
		if( platform.is('android') ) {
	      this.killVideos()
	    }
	}

	inputData: IComponentInputData = {
		// anything that the template needs access to goes here
		pages: JSON.parse( window.localStorage.getItem( 'myappp' ) ),
		segments: JSON.parse( window.localStorage.getItem( 'segments' ) ),
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
		back: () => {
			this.nav.pop()
		},
		mediaModal: ( src, img = null ) => {

			let modal = this.modalCtrl.create(MediaPlayer, {source: src, image: img});
			modal.present();

		},
		updateData: () => {
			window.localStorage.removeItem( 'myappp' )
			this.storage.remove('segments')
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
		showSegments: () => {
			let modal = this.modalCtrl.create(PushSettings);
			modal.present();
		},
		showLanguages: () => {
			let modal = this.modalCtrl.create(LanguageSettings);
			modal.present();
		}
	}

	ngOnInit() {
		// console.log(this.navParams);
		// set our custom template url
		let slug = this.navParams.data.slug;

		// this.templateUrl = 'custom.html'
		this.templateUrl = 'build/' + slug + '.html?' + this.random(1, 999);

		this.listener()

	}

	ionViewWillEnter() {

        if( this.platform.isRTL() && this.viewCtrl.enableBack() ) {
            this.viewCtrl.showBackButton(false)
            this.rtlBack = true
        }

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

}