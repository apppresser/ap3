import {Component, Renderer, ElementRef, OnInit, Input} from '@angular/core';
import {Nav, NavParams, ModalController, Platform, ViewController, Events, IonicPage} from 'ionic-angular';
import {TranslateService} from '@ngx-translate/core';
import {Storage} from '@ionic/storage';

import {IonicModule, ToastController} from 'ionic-angular';

import {HeaderLogo} from '../../providers/header-logo/header-logo';

/*
 * Template for creating custom HTML pages
 */
@IonicPage({
  priority: 'high'
})
@Component({
  templateUrl: "custom-html-template.html"
})
export class Page597 implements OnInit {

	pagetitle: string;
	listenFunc: Function;
	rtlBack: boolean = false;
	language: any;
	templateUrl: string;
	extraModules = [IonicModule];
	langs: any;
	pages: any = JSON.parse( window.localStorage.getItem( 'myappp' ) );
	segments: any = JSON.parse( window.localStorage.getItem( 'segments' ) );
	slug: string;
	header_logo_url: string;
	show_header_logo: boolean = false;
	customClasses: string;
	myLoginModal: any;

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
	}

	ngOnInit() {

		let slug = this.navParams.data.slug;
		this.slug = slug;

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
	        window.open( event.target.href, '_blank' );
	      }
	    });
	}

	pushPage(page) {

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
			this.nav.push( 'CustomPage', page, opt );
		} else if (page.url) {
			this.nav.push('Iframe', page, opt);
		} else {
			this.nav.push(page.component, page.navparams, opt);
		}
	}

	openPage( page ) {

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
			this.nav.setRoot( 'CustomPage', page );
		} else if (page.url) {
			this.nav.setRoot('Iframe', page);
		} else {
			this.nav.setRoot(page.component, page.navparams);
		}

	}

	back() {
		this.nav.pop()
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

		this.myLoginModal = this.modalCtrl.create( 'LoginModal' );

		this.myLoginModal.present();

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

}