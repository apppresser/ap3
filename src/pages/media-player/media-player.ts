import {Component} from '@angular/core';
import {NavParams, ViewController, IonicPage} from 'ionic-angular';
import {AnalyticsService} from '../../providers/analytics/analytics.service';
import { VgAPI } from 'videogular2/core';
import { Device } from '@ionic-native/device';

export interface IMedia {
  title: string;
  src: string;
  type: string;
  image: string;
}

@IonicPage()
@Component({
  templateUrl: 'media-player.html',
  selector: 'media-player'
})
export class MediaPlayer {

  source: any;
  sources: any;
  autoPlay: boolean = false;
  currentItem: IMedia;
  currentIndex = 0;
  playlist: Array<IMedia>;
  image: any;
  title: string = '';
  showVideoPlayer: boolean = true;
  imageSrc: string;
  isPdf: boolean = false;
  pdfSrc: any;
  api: VgAPI;

  constructor( 
    public navParams: NavParams, 
    private ga: AnalyticsService,
    public device: Device,
    public viewCtrl: ViewController 
  ) {
    this.source = navParams.get('source');
    this.image = navParams.get('image');
    this.currentIndex = navParams.get('index');
    this.currentItem = {
      title: navParams.get('title'),
      src: navParams.get('source'),
      type: this.getMimeType(navParams.get('source')),
      image: navParams.get('image')
    };
    this.sources = navParams.get('sources');
    this.autoPlay = navParams.get('autoPlay');
    this.playlist = navParams.get('sources');

    if(this.navParams.get('title')) {
      this.title = this.navParams.get('title');
    } else {
      this.title = 'Media Player';
    }

    var fileExt = this.source.split('.').pop();
    if( fileExt === 'jpg' || fileExt === 'png' || fileExt === 'jpeg' ) {
      this.showVideoPlayer = false;
    } else if( fileExt === 'pdf' ) {

      this.showVideoPlayer = false;
      this.isPdf = true;

      this.loadPdf().then( data => {
        this.pdfSrc = data
      })

    } else {
      this.showVideoPlayer = true;
    }

    if(this.source) {
      const action = (this.source && this.showVideoPlayer) ? 'play' : 'open';
      this.ga.trackScreenView('MediaPlayer', action + '/' + this.source);
    }
  }

  onPlayerReady(api: VgAPI) {
    this.api = api;
    this.api.getDefaultMedia().subscriptions.loadedMetadata.subscribe(this.playMedia.bind(this));
    this.api.getDefaultMedia().subscriptions.ended.subscribe(this.nextMedia.bind(this));
  }

  playMedia() {
    this.api.play();
  }

  nextMedia() {

    if(!this.autoPlay)
      return;

    // https://github.com/videogular/videogular2-showroom/blob/master/src/app/smart-playlist/smart-playlist.component.html

    this.currentIndex++;

    if (this.currentIndex === this.playlist.length) {
        this.currentIndex = 0;
    }

    // Might be a PDF so turn off autoplay
    if(this.playlist[this.currentIndex].type === '') {
      this.autoPlay = false;
      return;
    }

    this.currentItem = this.playlist[ this.currentIndex ];
    this.title = this.currentItem.title;
}

  // https://github.com/VadimDez/ng2-pdf-viewer/issues/180
  loadPdf() {

    return new Promise<string>((resolve, reject) => {

    const request = new XMLHttpRequest();
      request.open('GET', this.source, true);
      request.responseType = 'blob';

      request.onload = () => {
        const reader = new FileReader();

        reader.onload = (e: any) => resolve(e.target.result);
        reader.onerror = err => reject(err);
        reader.readAsDataURL(request.response);
      };

      request.send();
    });

  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  toggleAutoPlay() {
    this.autoPlay = (!this.autoPlay);

    if(this.autoPlay && this.api.state == 'ended')
      this.nextMedia();
  }

  /**
   * Tip: we use mimetype to know when to remove/stop autoplay.
   * A PDF can't autoplay, so we don't give it a mimetype.
   * @param mediaUrl 
   */
  getMimeType( mediaUrl ) {

    if(!mediaUrl)
      return '';

    let fileExt = mediaUrl.split('.').pop();
    let mimeType = '';

    // .mp3, .m4a, .mov, .mp4
    switch(fileExt) {
      case 'mp3':
        mimeType = 'audio/mp3';
        break;
      case 'mp4':
        mimeType = 'video/mp4';
        break;
      case 'mov':
        mimeType = 'video/quicktime';
        break;
      case 'm4a':
        mimeType = 'audio/mp4a-latm';
        break;
      default:
        mimeType = '';
        break;
    }

    return mimeType;
  }

}