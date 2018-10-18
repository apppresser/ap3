import {Component} from '@angular/core';
import {NavParams, ViewController, IonicPage} from 'ionic-angular';
import {AnalyticsService} from '../../providers/analytics/analytics.service';

@IonicPage()
@Component({
  templateUrl: 'media-player.html',
  selector: 'media-player'
})
export class MediaPlayer {

  source: any;
  image: any;
  title: string = '';
  showVideoPlayer: boolean = true;
  imageSrc: string;
  isPdf: boolean = false;
  pdfSrc: any;

  constructor( 
    public navParams: NavParams, 
    private ga: AnalyticsService,
    public viewCtrl: ViewController 
    ) {
    this.source = navParams.get('source');
    this.image = navParams.get('image');

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

}