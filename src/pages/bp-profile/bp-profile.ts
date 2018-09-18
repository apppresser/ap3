import {NavController, NavParams, LoadingController, Platform, ViewController, IonicPage, Events, ToastController, ModalController} from 'ionic-angular';
import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {BpProvider} from '../../providers/buddypress/bp-provider';
import {Storage} from '@ionic/storage';

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
  isError: boolean = false;
  spinner: any;
  isMyProfile: boolean = false;
  notificationCount: any;

  constructor(
    public nav: NavController, 
    public navParams: NavParams, 
    public viewCtrl: ViewController,
    public platform: Platform,
    public events: Events,
    public bpProvider: BpProvider,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public storage: Storage,
    public translate: TranslateService
    ) {

    // set login data after modal login
    events.subscribe('user:login', data => {
      this.login_data = data
      this.user_id = this.login_data.user_id
      this.setupUser( true )
    });

  }

  ngOnInit() {

    if( this.platform.isRTL && this.viewCtrl.enableBack() ) {
        this.viewCtrl.showBackButton(false)
        this.rtlBack = true
    }

    if( this.navParams ) {
      this.user_id = this.navParams.get('user_id');

      this.login_data = this.navParams.get('login_data');
    }

    if( !this.user_id && !this.login_data ) {
      this.checkLogin()
    } else {
      this.setupUser( true )
    }    

  }

  ionViewWillEnter() {

    // update profile when cached
    if( this.userData ) {
      this.setupUser( false )
    }

    this.getNotifications()

  }

  checkLogin() {

    // if we are here it's probably because this page was loaded from the menu, not from the members list page
    this.storage.get( 'user_login' ).then( login_data => {

      if( login_data && login_data.user_id ) {
        this.login_data = login_data
        this.user_id = this.login_data.user_id
        this.setupUser( true )
      } else {
        this.isError = true
      }

    })
  }

  setupUser( spinner ) {

    this.isError = false

    if( spinner )
      this.showSpinner()

    if( this.user_id === this.login_data.user_id ) {
      this.isMyProfile = true
    }

    this.bpProvider.getItem( 'members/' + this.user_id, this.login_data ).then( data => {

      this.userData = data
      this.hideSpinner()
    }).catch( e => {
      this.isError = true
      console.warn(e)
      this.hideSpinner()
    })

  }

  userActivity( userData ) {

    this.nav.push('BpList', {
      list_route: 'activity',
      user_activity: userData.id
    })

  }

  // maybe add https to avatar url
  formatUrl( url ) {

    if( !url )
      return;

    if( url.indexOf('http') >= 0 ) {
      return url;
    } else {
      return 'https:' + url;
    }

  }

  showMessages() {

    this.nav.push( 'BpMessages' )

  }

  notificationsPage() {
    this.nav.push( 'BpNotifications' )
  }

  doFriend( friendId, unfriend ) {

    this.showSpinner()

    this.bpProvider.doFriend( friendId, this.login_data, unfriend ).then( response => {
      
      this.presentToast( response )

      this.hideSpinner()
    }).catch( e => {

      this.translate.get('There was a problem.').subscribe( text => {
        
        let msg = text;
  
        console.warn(e)
        if(e.status && e.status == 404) {
          msg = 'Friendship connections are not enabled';
        }
        this.presentToast(msg);
        this.hideSpinner()
      });

    })

  }

  message( userData ) {

    this.nav.push( 'BpMessages', {
      singleThread: true,
      newThread: true,
      login_data: this.login_data,
      recipients: userData.id
    });

  }

  getNotifications() {

    if( !this.login_data )
      return;

    this.bpProvider.getNotifications( this.login_data ).then(items => {

      // Loads posts from WordPress API
      this.notificationCount = (<any>items).length;

    }).catch((err) => {

      console.warn(err)

    });

  }

  iabLink(link) {
    window.open( link, '_blank' );
  }

  openLoginModal() {

    const loginModal = this.modalCtrl.create('LoginModal' );
    loginModal.present();

  }

  presentToast(msg) {

    this.translate.get(msg).subscribe( translation => {

      let toast = this.toastCtrl.create({
        message: msg,
        duration: 3000,
        position: 'bottom'
      });

      toast.present();

    })

  }

  showSpinner() {
    this.spinner = this.loadingCtrl.create();

    this.spinner.present();
  }

  hideSpinner() {

    if( this.spinner ) {
      this.spinner.dismiss();
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