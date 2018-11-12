import {NavController, NavParams, LoadingController, ToastController, ModalController, Platform, ViewController, Content, IonicPage, Events} from 'ionic-angular';
import {Component, ViewChild, OnInit, Input, Renderer, ElementRef} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Posts} from '../../providers/posts/posts';
import {GlobalVars} from '../../providers/globalvars/globalvars';
import {HeaderLogo} from '../../providers/header-logo/header-logo';
import {Storage} from '@ionic/storage';
import {Device} from '@ionic-native/device';
import {Network} from '@ionic-native/network';
import {BpProvider} from '../../providers/buddypress/bp-provider';
import {AnalyticsService} from '../../providers/analytics/analytics.service';

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
  noItems: boolean = false;
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
  customHeaderClasses: string = '';
  login_data: any;
  groupId: any;
  groupList: boolean = false;
  memberList: boolean = false;
  activityList: boolean = false;
  groupLink: any;
  bpSegments: any;
  myGroups: boolean = false;
  showAllGroups: boolean = false;
  isUserActivity: boolean = false;
  segments: any;
  showSearch: boolean = false;
  notifications: any;
  listenFunc: Function;

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
    private ga: AnalyticsService,
    public bpProvider: BpProvider,
    public translate: TranslateService,
    public renderer: Renderer,
    public elementRef: ElementRef
  ) {

    if( !navParams.data.list_route )
      return;

    this.title = navParams.data.title;

    this.customClasses = 'bp-list' + ((navParams.data.slug) ? ' page-' + navParams.data.slug : '');
    this.customHeaderClasses = (navParams.data.slug) ? ' header-' + navParams.data.slug : '';


    if(navParams.data.is_home == true) {
      this.doLogo()
    }

    this.eventSubscribe()
    
  }

  ngOnInit() {

    // get login data on first load
    this.storage.get('user_login').then( data => {

      if( data ) {
        this.login_data = data
      }

      this.getStarted()

    });

    // is this activity, members, groups, etc
    this.setupComponent()

    // add toolbar for Friends, All, etc
    this.setupSegments()

  }

  getLoginData() {

    this.storage.get('user_login').then( data => {

      if( data ) {
        this.login_data = data
        this.getNotifications()
      }

    });

  }

  getStarted() {

    this.networkState = this.Network.type;

    if( this.networkState === 'none' || this.networkState === 'unknown' ) {

      // if offline, get posts from storage
      this.getStoredPosts();

    } else {

      this.getRoute().then( route => {

        this.loadItems( route )

      }).catch( err => {
        console.warn(err)
      })
		  
    }

  }

  ionViewWillEnter() {

    this.getLoginData()

    if( this.platform.isRTL && this.viewCtrl.enableBack() ) {
        this.viewCtrl.showBackButton(false)
        this.rtlBack = true
    }

    if(this.navParams.data.slug) {
      const list_route = (this.navParams.data.list_route) ? this.navParams.data.list_route + '/' : '';
      const list_slug  = this.navParams.data.slug;
      this.ga.trackScreenView('BpList', list_route + list_slug);
    }
 
  }

  // set this.route with correct url
  getRoute() {

    return new Promise( ( resolve, reject ) => {

      let item = window.localStorage.getItem( 'myappp' );
      let wp_url = JSON.parse( item ).wordpress_url;
      let rest_base = 'wp-json/ap-bp/v1/';

      if( !wp_url ) {
        alert('Please add a WordPress URL in your app settings.')
        reject('No WordPress URL set.')
      }

      // list route is actually a component for BuddyPress, for example 'activity'
      let component = this.navParams.data.list_route;

      this.route = wp_url + rest_base + component;

      let route = this.addParams( this.route );

      resolve( route )

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

  eventSubscribe() {

    // push new activity item after posted
    this.events.subscribe('bp-add-activity', data => {

      if( this.activityList ) {
        this.items.unshift( data[0] )
      }

      this.noItems = false

    });

    // set login data after modal login
    this.events.subscribe('user:login', data => {
      this.login_data = data
    });

    this.events.subscribe('user:logout', data => {
      this.login_data = null;
    });

  }

  setupComponent() {

    let component = this.navParams.data.list_route;

    // show activity, group, or members list
    if( component == 'groups' ) {

      this.groupList = true

    } else if( component == 'members' ) {

      this.memberList = true

    } else if( component == 'activity' ) {

      this.activityList = true

    }

  }

  setupSegments() {

    if( this.navParams.data.user_activity ) {
      this.bpSegments = null;
      this.isUserActivity = true;
    } else if( this.groupList ) {
      this.bpSegments = [ { name: 'My Groups' },{ name: 'All' } ];
    } else if( this.activityList ) {
      this.bpSegments = [ { name: 'All' }, { name: 'Friends' }, { name: 'Mentions' }, { name: 'Me' } ];
    } else if( this.memberList ) {
      this.bpSegments = [ { name: 'All' }, { name: 'Friends' } ];
    }

    // no segments in group activity
    if( this.activityList && this.navParams.data.group_id ) {
      this.bpSegments = null;
    }

    if( this.bpSegments ) {
      // fixes iphoneX status bar padding
      this.customClasses += ' has-favorites';
    }

  }

  segmentChanged() {

    this.segments = this.segments.trim()

    if( false === this.loginCheck() )
      return;

    let args = this.getSegmentArg()

    let route = this.addQueryParam( this.route, args )

    this.loadItems( route )
    
  }

  getSegmentArg() {

    if( this.activityList ) {

      if( this.segments === 'Friends' && this.login_data && this.login_data.user_id ) {

        return 'scope=friends&user=' + this.login_data.user_id;

      } else if( this.segments === 'Mentions' && this.login_data && this.login_data.username ) {

        return 'search=@' + this.login_data.username;

      } else if( this.segments === 'Me' && this.login_data && this.login_data.username ) {

        return 'user=' + this.login_data.user_id;

      }

    } else if( this.groupList ) {

      switch(this.segments) {
        case 'All':
          this.myGroups = false
          this.showAllGroups = true
          break;
        case 'My Groups':
          this.myGroups = true
          // add user_id to show my groups
          return 'user_id=' + this.login_data.user_id;
      }

    } else if( this.memberList ) {

      switch(this.segments) {
        case 'Friends':
          // add user to show my friends
          return 'user=' + this.login_data.user_id;
      }

    }

    return '';

  }

  // get posts from storage when we are offline
  getStoredPosts() {

    this.storage.get( this.route.substr(-10, 10) + '_bp' ).then( posts => {
      if( posts ) {
        this.items = posts;
        this.setListener()
      } else {
        this.presentToast('No data available, pull to refresh when you are online.');
      }
    });

  }

  // add params for filtering activity
  addParams( route ) {

    // fix error getting posts on reload
    if( typeof this.route != 'string' )
      return;

    // display activities
    if( this.activityList ) {

      route += '?type=activity_update&display_comments=false'

      // add this to the global route also
      this.route += '?type=activity_update&display_comments=false'

      route = this.addActivityParams( route )

    }

    route = this.addQueryParam( route, this.getSegmentArg() );

    return route;

  }

  // the logic that tells us what activity to display
  addActivityParams( route ) {

    // maybe add the type of activity. group, member, etc
    if( this.navParams.data.group_id ) {

      route = this.addQueryParam( route, 'primary_id=' + this.navParams.data.group_id )
      this.groupId = this.navParams.data.group_id
      this.groupLink = this.navParams.data.group_link

    } else if( this.navParams.data.user_activity ) {

      route = this.addQueryParam( route, '&user=' + this.navParams.data.user_activity )

    }

    return route;

  }

  loadItems( route, more = true ) {

  	if( !route )
  		return;

    let loading = this.loadingController.create({
        showBackdrop: false,
        //dismissOnPageChange: true
    });

    loading.present(loading);

    this.page = 1;

    let login;

    // for some requests, we don't want to send login data
    if( this.activityList || this.memberList && this.segments === "Friends" ) {  
      login = this.login_data
    }
    
    // any menu imported from WP has to use same component. Other pages can be added manually with different components
    this.bpProvider.getItems( route, login, this.page ).then(items => {

      // Loads posts from WordPress API
      this.items = items;

      if( !(<any>items).length ) {
        this.noItems = true
      } else {
        this.noItems = false
      }

      this.storage.set( route.substr(-10, 10) + '_bp', items);

      this.setListener()

      // load more right away
      if( more )
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

  myProfile() {

    this.nav.push('BpProfilePage', {
      user_id: this.login_data.user_id,
      login_data: this.login_data
    });

  }

  doRefresh(refresh) {

    if( this.bpSegments && this.segments ) {

      this.segmentChanged()

    } else {

      this.getRoute().then( route => {
        this.loadItems( route );
      })

    }

    if( this.showSearch ) {
      this.toggleSearchBar()
    }

    // refresh.complete should happen when posts are loaded, not timeout
    setTimeout( ()=> refresh.complete(), 500);
  }

  loadMore(infiniteScroll) {

    this.page++;

    let login;
    this.getRoute().then( route => {

      // for some requests, we don't want to send login data
      if( this.activityList || this.memberList && this.segments === "Friends" ) {  
        login = this.login_data
      } else if( this.myGroups ) {
        route = this.addQueryParam( route, 'user_id=' + this.login_data.user_id )
      }

      // console.log('load more ' + this.page + route )

      this.bpProvider.getItems( route, login, this.page ).then(items => {
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


    })

  }

  getNotifications() {

    this.bpProvider.getNotifications( this.login_data ).then(items => {

      // Loads posts from WordPress API
      this.notifications = (<any>items).length;

    }).catch((err) => {

      console.warn(err)

    });

  }

  viewNotifications() {

    this.nav.push( 'BpNotifications' )

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

  favorite( item ) {

  	if( false === this.loginCheck() )
      return;

    // increment the count early, we undo this if it fails
    this.doFavCount(item)

  	this.bpProvider.updateItem( 'activity_favorite', this.login_data, item.id ).then( ret => {

  		if( !ret ) {
        this.undoFavCount(item)
  			this.presentToast('Cannot favorite this item.')
  		}
      
  	}).catch( e => {
      this.presentToast('There was a problem favoriting this item.')
      this.undoFavCount(item)
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

  undoFavCount(item) {

    if( !item.favorites ) {
      return;
    } else {
      item.favorites = parseInt( item.favorites ) - 1
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
  	this.nav.push('BpGroupPage', {
  		group_id: item.id
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

  toggleSearchBar() {
    if( this.showSearch === true ) {
      this.showSearch = false
    } else {
      this.showSearch = true
    }

    this.content.resize()
  }

  search(ev) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      // set to this.route so infinite scroll works
      let route = this.addQueryParam(this.route, 'search=' + val);
      this.loadItems( route, false )
    }

  }

  addQueryParam(url, param) {

    const separator = (url.indexOf('?') > 0) ? '&' : '?';
    return url + separator + param;
  }

  clearSearch() {

    this.loadItems( this.route )

  }

  setListener() {

    // remove listener first so we don't set it multiple times
    if( this.listenFunc ) {
      this.listenFunc()
    }

    // Listen for link clicks, open in in app browser
    this.listenFunc = this.renderer.listen(this.elementRef.nativeElement, 'click', (event) => {

      this.linkHandler( event.target )

    });
    
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

  linkHandler( el ) {

    var target = '_blank'
      
    if( el.href && el.href.indexOf('http') >= 0 ) {

      event.preventDefault()

      // handle @mention links
      if( el.href.indexOf('members') >= 0 && el.text.indexOf('@') === 0 ) {
        this.openMember( { user: el.text.split("@")[1] } )
        return;
      }

      if( el.classList && el.classList.contains('system') ) {
        target = '_system'
      }
      
      window.open( el.href, target )

    }

  }

  getGroupName( str ) {

    if( str.indexOf('group') === -1 )
      return;

    let ret = str.split('group')[1];

    if( ret )
      return ret;

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
      this.presentToast('Please log in or sign up.')
      const loginModal = this.modalCtrl.create('LoginModal' );
      loginModal.present();
      return false;
    }

    return true;
      
  }

  handleErr( err ) {

    console.error('Error getting posts', err);

    this.translate.get("Cannot show items.").subscribe( text => {
      let msg = text;
      if( err && err.status == 404 ) { 
        // activity streams are disabled in BuddyPress settings
        msg += 'Activity streams are not enabled';
      } else if( err['_body'] && JSON.parse( err['_body'] ).message ) {
        msg += ' ' + JSON.parse( err['_body'] ).message;
      }
      this.presentToast( msg );
    });

  }

}