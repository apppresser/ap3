import {NavController, NavParams, LoadingController, ToastController, ModalController, Platform, ViewController, Content, IonicPage, Events} from 'ionic-angular';
import {Component, ViewChild, Input, Renderer, ElementRef} from '@angular/core';
import {GlobalVars} from '../../providers/globalvars/globalvars';
import {TranslateService} from '@ngx-translate/core';
import {HeaderLogo} from '../../providers/header-logo/header-logo';
import {Storage} from '@ionic/storage';
import {Device} from '@ionic-native/device';
import {Network} from '@ionic-native/network';
import {BpProvider} from '../../providers/buddypress/bp-provider';
import {AnalyticsService} from '../../providers/analytics/analytics.service';

@IonicPage()
@Component({
  templateUrl: 'bp-messages.html',
  selector: 'bp-messages'
})
export class BpMessages {

  @ViewChild(Content) content: Content;

  selectedItem: any;
  threads: any;
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
  singleThread: boolean = false
  messageSegments: any;
  segment: any;
  boxArg: string = '?box=inbox'
  threadReply: string;
  listenFunc: Function;

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
    private events: Events,
    private ga: AnalyticsService,
    public bpProvider: BpProvider,
    public translate: TranslateService,
    public renderer: Renderer,
    public elementRef: ElementRef
  ) {

    let item = window.localStorage.getItem( 'myappp' );

    this.route = JSON.parse( item ).wordpress_url + 'wp-json/ap-bp/v1/messages'

    this.customClasses = 'bp-messages';

    if( this.navParams.data.singleThread ) {
      this.doSingleThread()
    } else {
      this.setupSegments()
    }

    this.title = navParams.data.title;

    if( !this.title ) {
      this.translate.get('Messages').subscribe( text => {
        this.title = text;
      });
    }

    if( this.navParams.data.senderAvatar ) {
      this.navParams.data.senderAvatar = this.formatUrl( this.navParams.data.senderAvatar )
    }

    if(navParams.data.is_home == true) {
      this.doLogo()
    }

    this.eventSubscribe()

    // Listen for link clicks, open in in app browser
    this.listenFunc = renderer.listen(elementRef.nativeElement, 'click', (event) => {

      this.iabLinks( event.target, event )

    });
    
  }

  eventSubscribe() {

    // push new activity item after posted
    this.events.subscribe('bp-add-message', data => {

      if( this.singleThread ) {

        if( !this.threads || !this.threads.messages ) {
          this.getThreads( this.route + '/' + data.threadId )
        } else {
          this.addMessage( data )

          this.scrollDown(500)
        }

        
      }

    });

  }

  // maybe add https to avatar url
  formatUrl( url ) {

    // console.log('format url', url)

    if( !url )
      return;

    if( url.indexOf('://') >= 0 ) {
      return url;
    } else {
      return 'https:' + url;
    }

  }

  getStarted() {

    this.networkState = this.Network.type;

    if( this.networkState === 'none' || this.networkState === 'unknown' ) {

      // if offline, get posts from storage
      this.getStoredPosts();

    } else {

      this.getThreads( this.route )
		  
    }

  }

  ionViewWillLeave() {
    // fixes a transition bug
    this.navParams.data.senderAvatar = null
  }

  ionViewWillEnter() {

    // get login data on first load
    this.storage.get('user_login').then( data => {

      if( data && data.user_id ) {
        this.login_data = data
      } else {
        this.events.publish( 'login:force_login' )
      }

      if( !this.singleThread ) {
        this.getStarted()
      }
      

    });

    if( this.platform.isRTL && this.viewCtrl.enableBack() ) {
        this.viewCtrl.showBackButton(false)
        this.rtlBack = true
    }

    if(this.navParams.data.slug) {
      const list_route = (this.navParams.data.list_route) ? this.navParams.data.list_route + '/' : '';
      const list_slug  = this.navParams.data.slug;
      this.ga.trackScreenView('BpMessages', list_route + list_slug);
    }
 
  }

  doSingleThread() {

    this.singleThread = true
    this.boxArg = ''
    this.login_data = this.navParams.data.login_data

    if( this.navParams.data.threadId ) {

      this.route = this.route + '/' + this.navParams.data.threadId;
      this.getStarted()

    } else if( this.navParams.data.newThread ) {

      this.translate.get('Message').subscribe( text => {
        
        let data: any = { message: true, title: text }
  
        if( this.navParams.data.recipients ) {
          data.recipients = this.navParams.data.recipients
        }
        let bpModal = this.modalCtrl.create( 'BpModal', data );
        bpModal.present();

      });
    }
  }

  addMessage( data ) {

    this.threads.messages.unshift( { 
      "subject": ( data.subject ? data.subject : null ), 
      "message": data.content,
      "sender_id": this.login_data.user_id,
      "sender_data": {
        name: this.login_data.username,
        avatar: this.login_data.avatar
      } } )

  }

  scrollDown( delay ) {

    if( !this.content || !this.content._scroll )
        return;

    setTimeout( ()=> {

      this.content.scrollToBottom(200).then( res => {
        console.log('scroll done', res)
      })

    }, delay )

  }

  setupSegments() {

    this.messageSegments = [ { name: 'Inbox', value: 'inbox' },{ name: 'Sent', value: 'sentbox' } ];

    // fixes iphoneX status bar padding
    this.customClasses += ' has-favorites';

  }

  segmentChanged() {

    switch(this.segment) {
      case 'Inbox':
        this.boxArg = '?box=inbox'
        this.getThreads( this.route )
        break;
      case 'Sent':
        this.boxArg = '?box=sentbox'
        this.getThreads( this.route )
    }
    
  }

  // get posts from storage when we are offline
  getStoredPosts() {

    this.storage.get( this.route.substr(-10, 10) + '_bp' ).then( threads => {
      if( threads ) {
        this.threads = threads;
      } else {
        this.presentToast('No data available, pull to refresh when you are online.');
      }
    });

  }

  loadThread( thread ) {

    let data:any = {
      singleThread: true,
      threadId: thread.id,
      login_data: this.login_data
    }

    if( thread.sender_data ) {
      data.senderAvatar = this.formatUrl( thread.sender_data.avatar )
      data.senderName = thread.sender_data.name
    }

    this.nav.push( 'BpMessages', data );

  }

  getThreads( route ) {

  	if( !route )
  		return;

    let loading = this.loadingController.create({
        showBackdrop: false,
        //dismissOnPageChange: true
    });

    loading.present(loading);

    this.page = 1;
    
    // any menu imported from WP has to use same component. Other pages can be added manually with different components
    this.bpProvider.getItems( route + this.boxArg, this.login_data, this.page ).then(items => {

      // Loads posts from WordPress API
      this.threads = items;

      if( this.singleThread ) {
        this.scrollDown(100)
      } else {
        // load more
        this.loadMore(null);
      }

      this.storage.set( route.substr(-10, 10) + '_bp', items);
      
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

    this.getThreads( this.route );

    // refresh.complete should happen when posts are loaded, not timeout
    setTimeout( ()=> refresh.complete(), 500);
  }

  loadMore(infiniteScroll) {

    this.page++;

    this.bpProvider.getItems( this.route + this.boxArg, this.login_data, this.page ).then(items => {
      // Loads posts from WordPress API
      let length = items["length"];

      if( length === 0 ) {
        if(infiniteScroll)
          infiniteScroll.complete();
        return;
      }

      for (var i = 0; i < length; ++i) {
        this.threads.push( items[i] );
      }

      this.storage.set( this.route.substr(-10, 10) + '_bp', this.threads);

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

    this.translate.get(msg).subscribe( translation => {

      let toast = this.toastCtrl.create({
        message: msg,
        duration: 3000,
        position: 'bottom'
      });

      toast.present();

    })

  }

  // we don't want to show auto-generated subjects, or empty subjects
  getSubject( subject ) {

    if( !subject || subject === '' || subject.indexOf('No Subject') >= 0 || subject == 'undefined' || subject && subject.indexOf('Re:') >= 0 ) {
      return null;
    } else {
      return subject + ':';
    }

  }

  // this pushes the message text to the thread, then sends it to the server. If there is an error, we remove the message.
  replyToThread() {

    // fake delay
    setTimeout( () => {
      this.addMessage( { subject: null, content: this.threadReply } )
      this.threadReply = ''
      this.scrollDown(1)
    }, 500 )
    

    let recipients = Object.keys( this.threads.recipients )
    
    this.bpProvider.sendMessage( recipients, this.login_data, '', this.threadReply, this.threads.thread_id ).then( ret => {

        console.log('message sent, thread id: ', ret)

      }).catch( e => {

        console.warn(e)
        this.threads.messages.shift()
        this.presentToast('There was a problem, please try again.')

      });

  }

  newMessage() {

    this.nav.push( 'BpMessages', {
      singleThread: true,
      newThread: true,
      login_data: this.login_data
    });

  }

  iabLink(link) {
  	window.open( link, '_blank' );
  }

  iabLinks( el, event? ) {

    let target = '_blank'
      
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
      if( err['_body'] && JSON.parse( err['_body'] ).message ) {
        msg += ' ' + JSON.parse( err['_body'] ).message;
      }
      this.presentToast( msg );
    });

  }

}