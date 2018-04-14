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

  constructor( public navParams: NavParams, public viewCtrl: ViewController ) {
    this.source = navParams.get('source');
    this.image = navParams.get('image');

    if(this.navParams.get('title')) {
      this.title = this.navParams.get('title');
    } else {
      this.title = 'Media Player';
    }
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}