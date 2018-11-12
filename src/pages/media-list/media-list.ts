import {NavController, NavParams, LoadingController, ToastController, Platform, ViewController, Content, IonicPage, ModalController, Events} from 'ionic-angular';
import {Component, ViewChild, OnInit, Input, NgZone} from '@angular/core';
import {Posts} from '../../providers/posts/posts';
import {GlobalVars} from '../../providers/globalvars/globalvars';
import {HeaderLogo} from '../../providers/header-logo/header-logo';
import {Storage} from '@ionic/storage';
import {Device} from '@ionic-native/device';
import {Network} from '@ionic-native/network';
import {Download} from '../../providers/download/download';
import {File} from '@ionic-native/file';
import {TranslateService} from '@ngx-translate/core';

declare var cordova:any;

@IonicPage()
@Component({
  templateUrl: 'media-list.html',
  selector: 'media-list'
})
export class MediaList implements OnInit {

  @ViewChild(Content) content: Content;
  @Input('progress') progress;

  selectedItem: any;
  icons: string[];
  items: any = [];
  page: number = 1;
  siteurl: string;
  route: string;
  title: string;
  defaultlist: boolean = false
  cardlist: boolean = false;
  downloads: any = [];
  doDownloads: boolean = false;
  showSearch: boolean = false;
  rtlBack: boolean = false;
  networkState: any;
  header_logo_url: string;
  show_header_logo: boolean = false;
  customClasses: string = '';
  customHeaderClasses: string = '';
  loadProgress: any = 0;
  showFeaturedImage: boolean = false;

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
    public download: Download,
    public modalCtrl: ModalController,
    public file: File,
    public translate: TranslateService,
    public events: Events,
    public zone: NgZone
  ) {

    events.subscribe('load:progress', (progress) => {
      this.doProgress(progress);
    });

    this.selectedItem = navParams.data;

    this.route = navParams.data.list_route;

    this.title = navParams.data.title;

    if(navParams.data.is_home == true) {
      this.doLogo()
    }

    if( navParams.data.allow_downloads && navParams.data.allow_downloads === "true" ) {
      this.doDownloads = true;
    }

    if( navParams.data.download_list_image && navParams.data.download_list_image === "image" ) {
      this.showFeaturedImage = true;
    }

    this.previewAlert(this.route);

    this.customClasses = 'post-list has-favorites' + ((navParams.data.slug) ? ' page-' + navParams.data.slug : '');
    this.customHeaderClasses = (navParams.data.slug) ? ' header-' + navParams.data.slug : '';

    this.zone = new NgZone({ enableLongStackTrace: false });
    
  }

  ngOnInit() {

    this.networkState = this.Network.type;

    if( this.networkState === 'none' || this.networkState === 'unknown' ) {
      // if offline, get posts from storage
      this.getStoredPosts();
    } else {
      this.loadPosts( this.route );
    }

  }

  ionViewWillEnter() {

    if( this.platform.isRTL && this.viewCtrl.enableBack() ) {
        this.viewCtrl.showBackButton(false)
        this.rtlBack = true
    }

    this.storage.get( this.route.substr(-10, 10) + '_downloads' ).then( (downloads) => {
      if( downloads )
        this.downloads = downloads
    })
 
  }

  // get posts from storage when we are offline
  getStoredPosts() {

    this.storage.get( this.route.substr(-10, 10) + '_posts' ).then( posts => {
      if( posts ) {
        this.items = posts;
      } else {
        this.presentToast('No data available, pull to refresh when you are online.');
      }
    });

  }

  loadPosts( route ) {

    let loading = this.loadingController.create({
        showBackdrop: false,
        //dismissOnPageChange: true
    });

    loading.present(loading);

    this.page = 1;
    
    // any menu imported from WP has to use same component. Other pages can be added manually with different components
    this.postService.load( route, this.page ).then(items => {

      this.items = []

      // only add if we have a media url
      for (var i = 0; i < (<any>items).length; ++i) {
        if( items[i].appp_media && items[i].appp_media.media_url ) {
          this.items.push(items[i])
        }
      }

      // console.log(this.items)

      if( !this.items.length ) {
        this.presentToast('No media urls are defined.')
        console.log("Please add media urls according to the AppPresser documentation.")
        return;
      }

      this.mergeDownloadData()

      this.storage.set( route.substr(-10, 10) + '_posts', items);

      // load more right away
      this.loadMore(null);
      loading.dismiss();
    }).catch((err) => {
      loading.dismiss();
      console.error('Error getting posts', err);
      this.presentToast('Error getting posts.');
    });

    setTimeout(() => {
        loading.dismiss();
    }, 8000);

  }

  doRefresh(refresh) {
    this.loadPosts( this.route );
    // refresh.complete should happen when posts are loaded, not timeout
    setTimeout( ()=> refresh.complete(), 500);
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
      this.route = this.addQueryParam(this.navParams.data.list_route, 'search=' + val);
      this.loadPosts( this.route )
    }

  }

  addQueryParam(url, param) {
    const separator = (url.indexOf('?') > 0) ? '&' : '?';
    return url + separator + param;
  }

  clearSearch() {
    // reset to original query
    this.route = this.navParams.data.list_route;
    this.loadPosts(this.route)
  }

  loadMore(infiniteScroll) {

    this.page++;

    this.postService.load( this.route, this.page ).then(items => {
      // Loads posts from WordPress API
      let length = items["length"];

      if( length === 0 ) {
        if(infiniteScroll)
          infiniteScroll.complete();
        return;
      }

      // only add if we have a media url
      for (var i = 0; i < length; ++i) {
        if( items[i].appp_media && items[i].appp_media.media_url ) {
          this.items.push(items[i])
        }
      }

      this.storage.set( this.route.substr(-10, 10) + '_posts', this.items);

      if(infiniteScroll)
        infiniteScroll.complete();

    }).catch( e => {
      // promise was rejected, usually a 404 or error response from API
      if(infiniteScroll)
        infiniteScroll.complete();

      console.warn(e)

    });

  }

  // add or remove download to storage and download or delete file
  addDownload(item) {

    if( typeof this.Device.platform != 'string' ) {
      this.presentToast("Please try from a device.")
      return;
    }

    var inArray = false;

    for (let i = this.downloads.length - 1; i >= 0; i--) {

      if( this.downloads[i].id === item.id ) {
        inArray = true;
        break;
      }
    }

    // Don't add duplicate favs
    if( inArray === false ) {

      // download the file
      this.download.downloadFile( item.appp_media.media_url ).then( downloadUrl => {

        console.log(downloadUrl)

        if(downloadUrl) {

          this.loadProgress = 0

          item.download_url = downloadUrl

          item.downloaded = true

          this.saveDownload( item )

          this.presentToast('Downloaded!');

        } else {

          this.presentToast('Problem downloading file.');

        }

      })
      .catch( e => {
        console.log('file download error', e)
      })

    } else {

      let path = cordova.file.dataDirectory + 'media/';
      let fileName = item.download_url.replace(/^.*[\\\/]/, '');

      item.download_url = ''
      item.downloaded = false

      console.log('remove file ' + path + fileName )

      this.file.removeFile( path, fileName ).then( msg => {

        this.removeDownloadSuccess( item.id )

        }, (error) => {

          console.warn(error)

          // still remove data if file not found
          if( error.code == 1 ) {
            this.removeDownloadSuccess( item.id )
          }

      })

    }

  }

  removeDownloadSuccess( id ) {

    this.removeDownloadData( id )

    // remove from downloads and delete file
    for (let i = this.downloads.length - 1; i >= 0; i--) {
      if( this.downloads[i].id === id ) {
        this.downloads.splice(i, 1);
        break;
      }
    }

    this.storage.set( this.route.substr(-10, 10) + '_downloads', this.downloads );

    this.presentToast('Download Removed');

  }

  // if an item is downloaded already, merge that data with this.items after a refresh
  mergeDownloadData() {

    // loop through downloads and for each one, search this.items for a match. If there's a match, replace it and update this.items and storage

    this.storage.get( this.route.substr(-10, 10) + '_downloads').then( downloaded => {

      if( !downloaded )
        return

      this.downloads = downloaded

      // add download data to existing post objects
      for (let i = downloaded.length - 1; i >= 0; i--) {
        this.replaceItem( i )
      }

      this.storage.set( this.route.substr(-10, 10) + '_posts', this.items);

    })

  }

  // loop through this.items and replace with downloaded item so we can show green download icon
  replaceItem( download_key ) {

    for (var i = 0; i < this.items.length; ++i) {
      if( this.downloads[download_key].id === this.items[i].id ) {
        console.log( this.items[i] )
        this.items[i] = this.downloads[download_key]
      }
    }

  }

  // set this.downloaded to false in item storage after deleting download
  removeDownloadData( item_id ) {

    this.storage.get( this.route.substr(-10, 10) + '_posts' ).then( posts => {

      if( !posts )
        return;

      for (var i = 0; i < posts.length; ++i) {
        if( posts[i].id === item_id ) {
          posts[i].downloaded = false
          posts[i].download_url = ''
        }
      }

      this.items = posts

      this.storage.set( this.route.substr(-10, 10) + '_posts', posts )
    })


  }

  saveDownload( item ) {

    this.downloads.push(item);

    // save to local list
    this.storage.set( this.route.substr(-10, 10) + '_downloads', this.downloads);

    // save to master list also
    this.storage.get( 'downloads' ).then( downloads => {

      if( downloads ) {

        downloads.push( { title: item.title.rendered, url: item.download_url } )

      } else {

        downloads = [ { title: item.title.rendered, url: item.download_url } ]

      }

      this.storage.set( 'downloads', downloads )

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

  showDownloads() {

    this.storage.get( this.route.substr(-10, 10) + '_downloads' ).then( (downloads) => {

      if( downloads && downloads.length) {

        this.downloads = downloads;

        this.items = downloads;

      } else {
        this.translate.get('Click the download icon to download an item.').subscribe( text => {
          this.presentToast(text);
        })
      }

    });

  }

  showAll() {

    this.storage.get( this.route.substr(-10, 10) + '_posts' ).then((items) => {

      if( items ) {
        this.items = items;
        this.mergeDownloadData()
      } else {
        this.loadPosts( this.route )
      }

    });

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

  mediaModal( item ) {

    console.log(item)

    let url = ''

    if( item.downloaded && item.download_url ) {
      url = item.download_url
    } else {
      url = item.appp_media.media_url
    }

    let modal = this.modalCtrl.create('MediaPlayer', {source: url });
    modal.present();

  }

  doProgress(progress) {

    // progress doesn't update unless in a zone
    this.zone.run(() => {
      this.loadProgress = progress;
    })

  }

}