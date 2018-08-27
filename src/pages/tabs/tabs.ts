import {Component, OnInit, HostListener} from '@angular/core';
import {NavParams, IonicPage, ModalController, NavController, Events} from 'ionic-angular';

import {Iframe} from "../iframe/iframe";
import { LoginService } from '../../providers/logins/login.service';
import { LanguageService } from "../../providers/language/language.service";
import { User } from '../../models/user.model';

class ModalOptions {
	public cssClass?: string;
	public title?: string;
}

@IonicPage()
@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage implements OnInit {
  tabs: Array<any> = [];
  bodyTag: any;
  user: User;
  mySelectedIndex: number;
  login_modal: any;
  login_modal_open = false;

  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private events: Events,
    private loginservice: LoginService,
    private languageservice: LanguageService,
    public nav: NavController
  ) {}

  ngOnInit() {

    // Login status
    this.bodyTag = document.getElementsByTagName('body')[0];
    this.loginservice.loginStatus().subscribe(user => {
      this.user = user
      if(user) {
        this.bodyTag.classList.add('loggedin')
      } else {
        this.bodyTag.classList.remove('loggedin')
      }
    });


    this.mySelectedIndex = this.navParams.data.tabIndex || 0;

    // root=null if opening in the IAB
    for(let tab of this.navParams.data) {
      let target = this.maybeOpenIAB(tab);
      if(target) {
        tab.root = null;
        tab.target = target;
      }
      if(typeof(tab.extra_classes) !== 'undefined' && (tab.extra_classes.indexOf('loginmodal') >= 0||tab.extra_classes.indexOf('logoutmodal') >= 0)) {
        tab.root = null;
      }
      this.tabs.push(tab);
    }

  }

  onIonSelect($event, tab) {

    // yield login
    /**
     * TODO: test again in a newer version of Ionic
     * 
     * This feature isn't working because the ionSelect doesn't
     * allow you to $event.stopPropagation() or $event.preventDefault()
     * 
     * We need to test the yield login BEFORE transitioning to the selcted tab
     */
    // if(this.yieldLogin($event, tab))
    //   return false;
    

    if(tab.url && tab.target) {
      
      let url = tab.url;
      
      if(tab.target == '_system') {
        let use_language = (typeof(tab.extra_classes) !== 'undefined' && (tab.extra_classes.indexOf('use-language') >= 0));
        url = this.languageservice.removeAppParams(url, use_language);
      }

      this.openIab(url, tab.target);
    }
    if(typeof(tab.extra_classes) !== 'undefined' && (tab.extra_classes.indexOf('loginmodal') >= 0||tab.extra_classes.indexOf('logoutmodal') >= 0)) {
      this.loginModal({title:tab.title});
    }
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

  maybeOpenIAB(tab) {

    if (
      tab.extra_classes &&
      (tab.extra_classes.indexOf('system') >= 0 || tab.extra_classes.indexOf('external') >= 0) &&
      tab.url &&
      tab.url.indexOf('http') === 0
    ) {
      return this.getIabTarget(tab.extra_classes);
    }

    return false;
  }

  getIabTarget(extra_classes) {
    if(extra_classes.indexOf('system') >= 0) {
      return '_system';
    } else if(extra_classes.indexOf('external') >= 0) {
      return '_blank';
    }
    return false;
  }

  openIab( link, target, options = null ) {
    
    window.open(link, target, options );

  }

  /**
   * Open the login modal if the menu item's extra_classes contains 'yieldlogin'
   * @param tab 
   */
  yieldLogin($event, tab) {

    if(tab && tab.extra_classes && tab.extra_classes.indexOf('yieldlogin') >= 0) {
      if(this.user) { // logged in
        return false;
      } else { // logged out, show login modal
        this.events.publish('login:force_login');

        // This portion needs to work before using this function
        // $event.preventDefault();
        // $event.stopPropagation();
        return true;
      }
    }

    return false;
  }

  // ng2 way of adding a listener
  @HostListener('window:message', ['$event'])

  onMessage(event) {
    this.myListeners(event)
  }

  myListeners(e) {

    // if it's not our json object, return
    if (e.data.indexOf('{') != 0)
      return;

    var data = JSON.parse(e.data);

    // close all windows and then re-open root page, for LearnDash
    if( data.apppage && data.apppage.root ) {

      let page = { title: ( data.title ? data.title : '' ), component: Iframe, url: data.apppage.url, classes: null, page_type: null, type: null };
      // for learndash, when we have a redirect
      this.nav.popToRoot({animate: false}).then( ()=> {
        this.nav.push( Iframe, page );
      })

    }

  }

}
