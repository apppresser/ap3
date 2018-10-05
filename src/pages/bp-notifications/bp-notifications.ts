import {NavController, NavParams, LoadingController, ToastController, ModalController, Platform, ViewController, Content, IonicPage} from 'ionic-angular';
import {Component, ViewChild, Input} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {GlobalVars} from '../../providers/globalvars/globalvars';
import {HeaderLogo} from '../../providers/header-logo/header-logo';
import {Storage} from '@ionic/storage';
import {Device} from '@ionic-native/device';
import {Network} from '@ionic-native/network';
import {BpProvider} from '../../providers/buddypress/bp-provider';

@IonicPage()
@Component({
  templateUrl: 'bp-notifications.html',
  selector: 'bp-notifications'
})
export class BpNotifications {

  @ViewChild(Content) content: Content;

  items: any;
  route: string;
  loading: any;
  siteurl: string;
  title: string;
  rtlBack: boolean = false;
  networkState: any;
  header_logo_url: string;
  show_header_logo: boolean = false;
  customClasses: string = '';
  login_data: any;
  notificationSegments: any[];
  segment: any;
  segmentArgs: string;
  isRequests: boolean = false;

  constructor(
    public nav: NavController, 
    public navParams: NavParams,
    public globalvars: GlobalVars, 
    public loadingController: LoadingController, 
    public storage: Storage, 
    public toastCtrl: ToastController,
    public viewCtrl: ViewController,
    public platform: Platform,
    private headerLogoService: HeaderLogo,
    private Network: Network,
    private Device: Device,
    public modalCtrl: ModalController,
    public bpProvider: BpProvider,
    public translate: TranslateService
  ) {

    let item = window.localStorage.getItem( 'myappp' );

    this.route = JSON.parse( item ).wordpress_url + 'wp-json/ap-bp/v1/notifications';

    if( this.navParams.get('requests') ) {

      this.isRequests = true
      this.route = JSON.parse( item ).wordpress_url + 'wp-json/ap-bp/v1/friends/requests';
      this.translate.get('Requests').subscribe( text => {
        this.title = text;
      });
    } else {
      this.translate.get('Notifications').subscribe( text => {
        this.title = text;
      });
    }

    // this.setupSegments();

    if(navParams.data.is_home == true) {
      this.doLogo()
    }

    // get login data on first load
    this.storage.get('user_login').then( data => {

      if( data && data.user_id ) {
        this.login_data = data
        this.getItems()
      } else {
        this.presentToast('Please log in.')
        this.nav.pop()
      }

    });
    
  }

  ionViewWillEnter() {

    if( this.platform.isRTL && this.viewCtrl.enableBack() ) {
        this.viewCtrl.showBackButton(false)
        this.rtlBack = true
    }
 
  }

  // setupSegments() {

  //   this.notificationSegments = [ { name: 'Friends', value: 'friends' },{ name: 'Requests', value: 'requests' } ];

  //   // fixes iphoneX status bar padding
  //   this.customClasses += ' has-favorites';

  // }

  // segmentChanged() {

  //   switch(this.segment) {
  //     case 'Friends':
  //       this.items = []
  //       this.isRequests = false;
  //       this.segmentArgs = '?user=' + this.login_data.user_id
  //       this.getItems( this.route )
  //       break;
  //     case 'Requests':
  //       this.items = []
  //       this.isRequests = true;
  //       this.segmentArgs = '/requests';
  //       this.getItems( this.route )
  //   }
    
  // }

  getItems() {

    this.loading = this.loadingController.create({
        showBackdrop: false,
        //dismissOnPageChange: true
    });

    this.loading.present(this.loading);

    if( this.isRequests ) {
      this.getRequests()
    } else {
      this.getNotifications()
    }

  }

  getRequests() {

    this.bpProvider.getItems( this.route, this.login_data, 1 ).then(items => {

      // Loads posts from WordPress API
      this.items = items;

      // this.storage.set( this.route.substr(-10, 10) + '_bp', items);

      this.loading.dismiss();
    }).catch((err) => {

      this.loading.dismiss();
      this.handleErr(err)

    });

  }

  getNotifications() {

    // any menu imported from WP has to use same component. Other pages can be added manually with different components
    this.bpProvider.getNotifications( this.login_data ).then(items => {

      // Loads posts from WordPress API
      this.items = items;

      this.loading.dismiss();
    }).catch((err) => {

      this.loading.dismiss();
      this.handleErr(err)

    });

  }

  clearNotification( notification ) {

    this.bpProvider.clearNotification( notification, this.login_data ).then(data => {

      this.removeFromList( notification )

    }).catch((err) => {

      this.handleErr(err)

    });

  }

  removeFromList( notification ) {

    for (let i = this.items.length - 1; i >= 0; i--) {
      if( this.items[i].id === notification.id ) {
        this.items.splice(i, 1);
        break;
      }
    }

    // refresh the list
    if( this.items.length ) {
      this.items = this.items;
    }

  }

  doRefresh(refresh) {

    this.getItems();

    // refresh.complete should happen when posts are loaded, not timeout
    setTimeout( ()=> refresh.complete(), 500);
  }

  acceptFriendship( friend, withdraw ) {

    var friend = friend;

    console.log(friend)

    this.bpProvider.acceptWithdrawFriendship( friend.id, this.login_data, withdraw ).then( ret => {

      for (let i = this.items.length - 1; i >= 0; i--) {
        if( this.items[i].id === friend.id ) {
          console.log(this.items[i])
          this.items.splice(i, 1);
          break;
        }
      }

      this.presentToast(ret)

    }).catch( e => {

      this.presentToast("There was a problem.")
      console.warn(e)

    });

  }

  viewNotification( notification ) {

    switch(notification.component) {
      case 'friends':
        this.showFriendRequests()
        break;
      case 'messages':
        this.nav.push( 'BpMessages' )
        break;
      case 'activity':
        this.nav.push( 'BpList', { list_route: 'activity'} )
        break;
      default:
        this.nav.push('PostDetailsPage', { 
          item: { 
            "content": { "rendered":  notification.content },
            "title":  { "rendered":  "Notification" }
          } 
        } )
    }
  }

  showFriendRequests() {

    this.nav.push('BpNotifications', {
      requests: true
    });

  }

  viewMember( member ) {

    this.nav.push('BpProfilePage', {
      user_id: member.id,
      login_data: this.login_data
    });

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

  iabLink(link) {
  	window.open( link, '_blank' );
  }

  // changes the back button transition direction if app is RTL
  backRtlTransition() {
    let obj = {}

    if( this.platform.is('ios') )
      obj = {direction: 'forward'}
    
    this.nav.pop( obj )
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

  // make sure user is logged in
  loginCheck() {

    if( !this.login_data || !this.login_data.user_id ) {
      this.presentToast('Please log in.')
      return false;
    }

    return true;
      
  }

  handleErr( err ) {

    console.error('Error getting posts', err);
    this.translate.get('Cannot show items.').subscribe( text => {
      let msg = text;
      if( err && err.status == 404 ) { 
        // notifications are disabled in BuddyPress settings
        msg += ' Notifications are not enabled.';
      } else if( err['_body'] && JSON.parse( err['_body'] ).message ) {
        msg += ' ' + JSON.parse( err['_body'] ).message;
      }
      this.presentToast( msg );
    });

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

}