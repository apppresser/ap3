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
  user_name: string;
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
      this.user_name = this.navParams.get('user_name');        
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

  ionSelected() {

    // close stacked pages if their open
    if(this.nav.length() > 1)
      this.nav.pop();


    if( this.userData ) {
      this.setupUser( false )
    }
    this.getNotifications();
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

  setupUser(spinner) {

        this.isError = false

        if (spinner)
            this.showSpinner()

        if (this.user_id === this.login_data.user_id) {
            this.isMyProfile = true
        }

        this._getBpMemberItem()
            .then(data => {
                this.userData = data
                this.hideSpinner()
            })
            .catch(e => {
                this.isError = true
                console.warn(e)
                this.hideSpinner()
            })

  }

  /**
   * Gets member data by username or id
   * @returns {Promise<any>}
   */
  private _getBpMemberItem(): Promise<any> {
    if (this.user_name) {
      return this.bpProvider.getMemberByName('members/' + this.user_name, this.login_data);
    } else {
      return this.bpProvider.getItem('members/' + this.user_id + '?user_id=' + this.login_data.user_id, this.login_data);
    }
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

  /**
   * Adds a friend
   * @param {number} friendId
   * @memberof BpProfilePage
   */
  public addFriend(friendId: number): void {
    this.showSpinner()
    this.bpProvider.addFriend(friendId, this.login_data)
      .then(response => {
        let message: string = this.translate.instant('Friendship request sent');
        this.presentToast(message);
        this.hideSpinner();
      })
      .catch(e => {
        console.warn(e)
        let message: string = (e.status && e.status == 404) ? this.translate.instant('Friendship connections are not enabled') : this.translate.instant('There was a problem');
        this.presentToast(message);
        this.hideSpinner();
      })
  }

  /**
   * Removes a friend
   * @param {number} friendId
   * @memberof BpProfilePage
   */
  public removeFriend(friendId: number): void {
    this.showSpinner()
    this.bpProvider.removeFriend(friendId, this.login_data)
      .then(response => {
        let message: string = this.translate.instant('Friendship removed');
        this.presentToast(message);
        this.hideSpinner();
      })
      .catch(e => {
        console.warn(e)
        let message: string = (e.status && e.status == 404) ? this.translate.instant('Friendship connections are not enabled') : this.translate.instant('There was a problem');
        this.presentToast(message);
        this.hideSpinner();
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

  /**
   * Opens the edit profile modal and updates the user data on dismiss
   */
  public openEditProfileModal(): void {
    const editProfileModal = this.modalCtrl.create('EditProfileModal');
    // Update user data after closing the edit profile modal
    editProfileModal.onDidDismiss(() => {
      this.setupUser(true);
    });
    editProfileModal.present();
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