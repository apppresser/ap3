import {NavController, NavParams, LoadingController, Platform, ViewController, IonicPage, Events, ToastController, ModalController} from 'ionic-angular';
import {Component} from '@angular/core';
import {BpProvider} from '../../providers/buddypress/bp-provider';
import {Storage} from '@ionic/storage';

@IonicPage()
@Component({
  templateUrl: 'bp-group.html',
  selector: 'bp-group'
})
export class BpGroupPage {

  content: any;
  rtlBack: boolean = false;
  groupId: any;
  groupData: any;
  login_data: any;
  spinner: any;

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
    });

    if( this.navParams ) {
      this.groupId = this.navParams.get('group_id');
    }

    if( !this.groupId )
      return;

    this.storage.get('user_login').then( data => {

      if( data ) {
        this.login_data = data
      }

      this.setupGroup()

    });    

  }

  ionViewWillEnter() {

    if( this.platform.isRTL && this.viewCtrl.enableBack() ) {
        this.viewCtrl.showBackButton(false)
        this.rtlBack = true
    } 

  }

  setupGroup() {

    this.bpProvider.getItem( 'groups/' + this.groupId, this.login_data ).then( data => {
      console.log(data)
      this.groupData = data
    }).catch( e => {
      console.warn(e)
    })

  }

  groupActivity() {

    this.nav.push('BpList', {
      list_route: 'activity',
      title: this.groupData.name,
      group_id: this.groupId,
      group_link: this.groupData.link
    });

  }

  joinGroup() {

    if( !this.login_data ) {
      this.presentToast('Please log in.')
      return;
    }

    this.bpProvider.joinGroup( this.groupData, this.login_data ).then( data => {
      if( data ) {
        this.presentToast('Joined group!')
      }
    }).catch( e => {
      this.presentToast('Could not join group.')
      console.warn(e)
    })

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