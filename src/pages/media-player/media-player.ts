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
      window.open( 'https://docs.google.com/gview?url=' + this.source, '_blank' );
      this.dismiss();
    } else {
      this.showVideoPlayer = true;
    }
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}