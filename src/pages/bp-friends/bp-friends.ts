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
  templateUrl: 'bp-friends.html',
  selector: 'bp-friends'
})
export class BpFriends {

  @ViewChild(Content) content: Content;

  friends: any;
  page: number = 1;
  route: string;
  siteurl: string;
  title: string;
  rtlBack: boolean = false;
  networkState: any;
  header_logo_url: string;
  show_header_logo: boolean = false;
  customClasses: string = '';
  login_data: any;
  friendSegments: any[];
  segment: any;
  segmentArgs: string;
  isRequests: boolean = true;

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

    this.route = JSON.parse( item ).wordpress_url + 'wp-json/ap-bp/v1/friends';

    this.setupSegments();

    this.title = 'Friends';

    if(navParams.data.is_home == true) {
      this.doLogo()
    }

    // get login data on first load
    this.storage.get('user_login').then( data => {

      if( data && data.user_id ) {
        this.login_data = data
        this.segmentArgs = '/requests'
        this.getStarted()
      } else {
        this.presentToast('Please login.')
        this.nav.pop()
      }

    });
    
  }

  getStarted() {

    this.networkState = this.Network.type;

    if( this.networkState === 'none' || this.networkState === 'unknown' ) {

      // if offline, get posts from storage
      this.getStoredPosts();

    } else {

      this.getFriends( this.route )
		  
    }

  }

  ionViewWillEnter() {

    if( this.platform.isRTL && this.viewCtrl.enableBack() ) {
        this.viewCtrl.showBackButton(false)
        this.rtlBack = true
    }
 
  }

  setupSegments() {

    this.friendSegments = [ { name: 'Friends', value: 'friends' },{ name: 'Requests', value: 'requests' } ];

    // fixes iphoneX status bar padding
    this.customClasses += ' has-favorites';

  }

  segmentChanged() {

    switch(this.segment) {
      case 'Friends':
        this.friends = []
        this.isRequests = false;
        this.segmentArgs = '?user=' + this.login_data.user_id
        this.getFriends( this.route )
        break;
      case 'Requests':
        this.friends = []
        this.isRequests = true;
        this.segmentArgs = '/requests';
        this.getFriends( this.route )
    }
    
  }

  // get posts from storage when we are offline
  getStoredPosts() {

    this.storage.get( this.route.substr(-10, 10) + '_bp' ).then( friends => {
      if( friends ) {
        this.friends = friends;
      } else {
        this.presentToast('No data available, pull to refresh when you are online.');
      }
    });

  }

  getFriends( route ) {

  	if( !route )
  		return;

    let loading = this.loadingController.create({
        showBackdrop: false,
        //dismissOnPageChange: true
    });

    loading.present(loading);

    this.page = 1;
    
    // any menu imported from WP has to use same component. Other pages can be added manually with different components
    this.bpProvider.getItems( route + this.segmentArgs, this.login_data, this.page ).then(items => {

      // Loads posts from WordPress API
      this.friends = items;

      this.storage.set( route.substr(-10, 10) + '_bp', items);

      // load more right away
      this.loadMore(null);
      loading.dismiss();
    }).catch((err) => {

      loading.dismiss();
      this.handleErr(err)

    });

    setTimeout(() => {
      if( loading )
        loading.dismiss();
    }, 8000);

  }

  doRefresh(refresh) {

    this.getFriends( this.route );

    // refresh.complete should happen when posts are loaded, not timeout
    setTimeout( ()=> refresh.complete(), 500);
  }

  loadMore(infiniteScroll) {

    // no pagination for requests
    if( this.isRequests )
      return;

    this.page++;

    this.bpProvider.getItems( this.route + this.segmentArgs, this.login_data, this.page ).then(items => {
      // Loads posts from WordPress API
      let length = items["length"];

      if( length === 0 ) {
        if(infiniteScroll)
          infiniteScroll.complete();
        return;
      }

      for (var i = 0; i < length; ++i) {
        this.friends.push( items[i] );
      }

      this.storage.set( this.route.substr(-10, 10) + '_bp', this.friends);

      if(infiniteScroll)
        infiniteScroll.complete();

    }).catch( e => {
      // promise was rejected, usually a 404 or error response from API
      if(infiniteScroll)
        infiniteScroll.complete();

      console.warn('load more error', e)

    });

  }

  acceptFriendship( friend, withdraw ) {

    var friend = friend;

    this.bpProvider.acceptWithdrawFriendship( friend.id, this.login_data, withdraw ).then( ret => {

      for (let i = this.friends.length - 1; i >= 0; i--) {
        if( this.friends[i].id === friend.id ) {
          console.log(this.friends[i])
          this.friends.splice(i, 1);
          break;
        }
      }

      this.presentToast(ret)

    }).catch( e => {

      this.presentToast("There was a problem.")
      console.warn(e)

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
    let msg = "Cannot show items.";
    if( err['_body'] && JSON.parse( err['_body'] ).message ) {
      msg += ' ' + JSON.parse( err['_body'] ).message;
    }
    this.presentToast( msg );

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