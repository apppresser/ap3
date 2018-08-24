import {NavController, NavParams, LoadingController, Platform, ViewController, IonicPage, Events, ToastController, ModalController} from 'ionic-angular';
import {Component} from '@angular/core';
import {BpProvider} from '../../providers/buddypress/bp-provider';
import {Storage} from '@ionic/storage';

@IonicPage()
@Component({
  templateUrl: 'bp-profile.html',
  selector: 'bp-profile'
})
export class BpProfilePage {

  content: any;
  listenFunc: Function;
  rtlBack: boolean = false;
  user_id: any;
  userData: any;
  login_data: any;
  spinner: any;
  isMyProfile: boolean = false;

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
    public storage: Storage
    ) {

    // set login data after modal login
    events.subscribe('user:login', data => {
      this.login_data = data
      this.user_id = this.login_data.user_id
      this.setupUser()
    });

  }

  ionViewWillEnter() {

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
      this.setupUser()
    }    

  }

  checkLogin() {

    // if we are here it's probably because this page was loaded from the menu, not from the members list page
    this.storage.get( 'user_login' ).then( login_data => {

      if( login_data ) {
        this.login_data = login_data
        this.user_id = this.login_data.user_id
        this.setupUser()
      } else {
        this.openLoginModal()
      }

    })
  }

  setupUser() {

    if( this.user_id === this.login_data.user_id ) {
      this.isMyProfile = true
    }

    this.bpProvider.getItem( 'members/' + this.user_id, this.login_data ).then( data => {
      console.log(data)
      this.userData = data
    }).catch( e => {
      console.warn(e)
    })

  }

  userActivity( userData ) {

    this.nav.push('BpList', {
      list_route: 'activity',
      user_activity: userData.id
    })

  }

  showMessages() {

    this.nav.push( 'BpMessages' )

  }

  doFriend( friendId, unfriend ) {

    this.showSpinner()

    this.bpProvider.doFriend( friendId, this.login_data, unfriend ).then( response => {
      
      this.presentToast( response )

      this.hideSpinner()
    }).catch( e => {

      console.warn(e)
      this.presentToast('There was a problem.')
      this.hideSpinner()

    })

  }

  message( userData ) {
    let data = { recipients: userData.id, message: true, title: 'Message' }
    let bpModal = this.modalCtrl.create( 'BpModal', data );
    bpModal.present();
  }

  iabLink(link) {
    window.open( link, '_blank' );
  }

  openLoginModal() {

    const loginModal = this.modalCtrl.create('LoginModal' );
    loginModal.present();

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

  showSpinner() {
    this.spinner = this.loadingCtrl.create();

    this.spinner.present();
  }

  hideSpinner() {
    this.spinner.dismiss();
  }

  // changes the back button transition direction if app is RTL
  backRtlTransition() {
    let obj = {}

    if( this.platform.is('ios') )
      obj = {direction: 'forward'}
    
    this.nav.pop( obj )
  }

}