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

  constructor( public navParams: NavParams, public viewCtrl: ViewController ) {
    this.source = navParams.get('source');
    this.image = navParams.get('image');
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}