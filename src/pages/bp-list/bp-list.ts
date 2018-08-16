import {NavController, NavParams, LoadingController, ToastController, ModalController, Platform, ViewController, Content, IonicPage, Events} from 'ionic-angular';
import {Component, ViewChild, OnInit, Input} from '@angular/core';
import {Posts} from '../../providers/posts/posts';
import {GlobalVars} from '../../providers/globalvars/globalvars';
import {HeaderLogo} from '../../providers/header-logo/header-logo';
import {Storage} from '@ionic/storage';
import {Device} from '@ionic-native/device';
import {Network} from '@ionic-native/network';
import {BpProvider} from '../../providers/buddypress/bp-provider';

@IonicPage()
@Component({
  templateUrl: 'bp-list.html',
  selector: 'bp-list'
})
export class BpList implements OnInit {

  @ViewChild(Content) content: Content;

  selectedItem: any;
  icons: string[];
  items: any;
  page: number = 1;
  siteurl: string;
  route: string;
  args: string;
  title: string;
  rtlBack: boolean = false;
  networkState: any;
  header_logo_url: string;
  show_header_logo: boolean = false;
  customClasses: string = '';
  login_data: any;
  groupId: any;
  groupList: boolean = false;
  memberList: boolean = false;
  activityList: boolean = false;
  groupLink: any;

  constructor(
    public nav: NavController, 
    public navParams: NavParams, 
    public postService: Posts, 
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
    private events: Events,
    public bpProvider: BpProvider
  ) {

  	console.log( navParams )

    this.route = navParams.data.list_route;

    if( !this.route )
      return;

    if( navParams.data.group_id ) {
  		this.groupId = navParams.data.group_id
  		// this.groupId = 1
  		this.args += '&primary_id=' + this.groupId
  		this.groupLink = navParams.data.group_link
  	}

  	// show activity, group, or members list
  	if( this.route.indexOf('groups') >= 0 ) {
  		this.groupList = true
  	} else if( this.route.indexOf('members') >= 0 ) {
  		this.memberList = true
  	} else {
  		this.activityList = true
  	}

    this.title = navParams.data.title;

    this.customClasses = 'post-list' + ((navParams.data.slug) ? ' page-' + navParams.data.slug : '');

    if(navParams.data.is_home == true) {
      this.doLogo()
    }

    this.previewAlert(this.route);

    // push new activity item after posted
    events.subscribe('bp-add-activity', data => {

    	if( this.activityList ) {
			  this.items.unshift( data[0] )
    	}

    });

    // set login data after modal login
    events.subscribe('user:login', data => {
      this.login_data = data
    });

    events.subscribe('user:logout', data => {
      this.login_data = null;
    });

    // get login data on first load
    this.storage.get('user_login').then( data => {

    	if(data) {
    	  this.login_data = data
    	}

    });
    
  }

  ngOnInit() {

    this.networkState = this.Network.type;

    if( this.networkState === 'none' || this.networkState === 'unknown' ) {
      // if offline, get posts from storage
      this.getStoredPosts();
    } else {

    	// fix error getting posts on reload
    	if( typeof this.route != 'string' )
    		return;

		  this.loadItems( this.route );
    }

  }

  ionViewWillEnter() {

    if( this.platform.isRTL && this.viewCtrl.enableBack() ) {
        this.viewCtrl.showBackButton(false)
        this.rtlBack = true
    }
 
  }

  // get posts from storage when we are offline
  getStoredPosts() {

    this.storage.get( this.route.substr(-10, 10) + '_bp' ).then( posts => {
      if( posts ) {
        this.items = posts;
      } else {
        this.presentToast('No data available, pull to refresh when you are online.');
      }
    });

  }

  loadItems( route ) {

  	if( !route )
  		return;

    let loading = this.loadingController.create({
        showBackdrop: false,
        //dismissOnPageChange: true
    });

    loading.present(loading);

    this.page = 1;
    
    // any menu imported from WP has to use same component. Other pages can be added manually with different components
    this.bpProvider.getItems( route, this.login_data, this.page ).then(items => {

      // Loads posts from WordPress API
      this.items = items;

      console.log(this.items)

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

  loadDetail(item) {

    let opt = {};

    if( this.platform.isRTL && this.platform.is('ios') )
      opt = { direction: 'back' }

    this.nav.push('BpDetailsPage', {
      item: item,
      route: this.route,
      login_data: this.login_data
    }, opt);
  }

  doRefresh(refresh) {
    this.loadItems( this.route );
    // refresh.complete should happen when posts are loaded, not timeout
    setTimeout( ()=> refresh.complete(), 500);
  }

  addQueryParam(url, param) {
    const separator = (url.indexOf('?') > 0) ? '&' : '?';
    return url + separator + param;
  }

  loadMore(infiniteScroll) {

    this.page++;

    console.log('load more ' + this.page + this.route )

    this.bpProvider.getItems( this.route, this.login_data, this.page ).then(items => {
      // Loads posts from WordPress API
      let length = items["length"];

      if( length === 0 ) {
        if(infiniteScroll)
          infiniteScroll.complete();
        return;
      }

      for (var i = 0; i < length; ++i) {
        this.items.push( items[i] );
      }

      this.storage.set( this.route.substr(-10, 10) + '_bp', this.items);

      if(infiniteScroll)
        infiniteScroll.complete();

    }).catch( e => {
      // promise was rejected, usually a 404 or error response from API
      if(infiniteScroll)
        infiniteScroll.complete();

      console.warn('load more error', e)

    });

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

  favorite( item ) {

  	if( false === this.loginCheck() )
      return;

  	this.bpProvider.updateItem( 'activity_favorite', this.login_data, item.id ).then( ret => {

      console.log(ret)

  		if( ret ) {
  			this.doFavCount(item)
  		} else {
  			this.presentToast('Cannot favorite this item.')
  		}
  	}).catch( e => {
      console.warn(e)
    })
  	
  }

  doFavCount(item) {

  	if( !item.favorites ) {
  		item.favorites = 1
  	} else {
  		item.favorites = parseInt( item.favorites ) + 1
  	}

  }

  doActivity() {

  	if( !this.login_data ) {
  		this.events.publish('login:force_login')
  	} else {
  		const bpModal = this.modalCtrl.create('BpModal', { route: this.route, group: this.groupId });
  		bpModal.present();
  	}

  }

  // Show alert in preview if not using https
  previewAlert(url) {

    if(!url) {
      return;
    }

    if( this.Device.platform != 'iOS' && this.Device.platform != 'Android' && url.indexOf('http://') >= 0 ) {
          alert('Cannot display http pages in browser preview. Please build app for device or use https.');
      }

  }

  openGroup(item) {

  	// switch route from /groups to /activity to get group activity
  	let route = this.route.split('groups')[0] + 'activity?type=activity_update&primary_id=' + item.id

  	this.nav.push('BpList', {
  		list_route: route,
  		title: item.name,
  		group_id: item.id,
  		group_link: item.link
  	});

  }

  openMember( item ) {

    if( false === this.loginCheck() )
      return;
  	
  	let id;
  	if( this.activityList ) {
  		id = item.user
  	} else {
  		id = item.id
  	}

    this.nav.push('BpProfilePage', {
      user_id: id,
      login_data: this.login_data
    });
  	
  }

  joinGroup( item ) {

    if( false === this.loginCheck() )
      return;

    this.bpProvider.joinGroup( item, this.login_data ).then( data => {
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

    if( !this.login_data ) {
      this.presentToast('You must be logged in to do that.')
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

}