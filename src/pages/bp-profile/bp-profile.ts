import {NavController, NavParams, ModalController, Platform, ViewController, IonicPage, Events} from 'ionic-angular';
import {Component, Renderer, ElementRef, OnInit} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {BpProvider} from '../../providers/buddypress/bp-provider';

@IonicPage()
@Component({
  templateUrl: 'bp-profile.html',
  selector: 'bp-profile'
})
export class BpProfilePage implements OnInit {

  content: any;
  listenFunc: Function;
  rtlBack: boolean = false;
  user_id: any;
  userData: any;
  login_data: any;

  constructor(
    public nav: NavController, 
    public navParams: NavParams, 
    public sanitizer: DomSanitizer,
    public modalCtrl: ModalController,
    public renderer: Renderer,
    public elementRef: ElementRef,
    public viewCtrl: ViewController,
    public platform: Platform,
    public events: Events,
    public bpProvider: BpProvider
    ) {

    this.user_id = this.navParams.get('user_id');

    this.login_data = this.navParams.get('login_data');

    if( !this.user_id )
      return;

  }

  ngOnInit() {

    this.setupUser()

  }

  setupUser() {

    this.bpProvider.getItem( 'members/' + this.user_id, this.login_data ).then( data => {
      console.log(data)
      this.userData = data
    }).catch( e => {
      console.warn(e)
    })

  }

  iabLinks( el ) {

    var target = '_blank'
      
    if( el.href && el.href.indexOf('http') >= 0 ) {

      if( el.classList && el.classList.contains('system') )
        target = '_system'

      event.preventDefault()
      window.open( el.href, target )

    } else if( el.tagName == 'IMG' && el.parentNode.href && el.parentNode.href.indexOf('http') >= 0 ) {

      // handle image tags that have link as the parent
      if( el.parentNode.classList && el.parentNode.classList.contains('system') )
        target = '_system'

      event.preventDefault()
      window.open( el.parentNode.href, target )

    }

  }

  userActivity( userData ) {

    this.nav.push('BpList', {
      list_route: 'activity',
      user_activity: userData.id
    })
    
  }

  iabLink(link) {
    window.open( link, '_blank' );
  }

  ionViewWillEnter() {

    if( this.platform.isRTL && this.viewCtrl.enableBack() ) {
        this.viewCtrl.showBackButton(false)
        this.rtlBack = true
    }
 
  }

  // changes the back button transition direction if app is RTL
  backRtlTransition() {
    let obj = {}

    if( this.platform.is('ios') )
      obj = {direction: 'forward'}
    
    this.nav.pop( obj )
  }

}