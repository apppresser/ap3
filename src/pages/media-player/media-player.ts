import {Component} from '@angular/core';
import {NavParams, ViewController, IonicPage} from 'ionic-angular';

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

  constructor( public navParams: NavParams, public viewCtrl: ViewController ) {
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

      (<any>window).pdfWorkerSrc = 'assets/lib/pdf-worker.min.js';

      this.showVideoPlayer = false;
      this.isPdf = true;
    } else {
      this.showVideoPlayer = true;
    }
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}