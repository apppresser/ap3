import { Component, Input, ViewChild } from "@angular/core";
import { NavParams, ViewController, Events } from "ionic-angular";
import { Storage } from "@ionic/storage";
import { TranslateService } from "@ngx-translate/core";
import {StreamingMediaPlayer} from '../../providers/streaming-media/streaming-media';

@Component({
  selector: "audio-player",
  templateUrl: "audio-player.html"
})
export class AudioPlayerComponent {

  progress: any = null;
  image: any = null;

  constructor( public navParams: NavParams, public viewCtrl: ViewController, public streamingMedia: StreamingMediaPlayer, public events: Events ) {
    console.log("audio player constructor", navParams.data);
    this.events.subscribe("audio_player_progress", position => {
      this.progress = position
    })
  }

  ngAfterViewInit() {
    if( this.navParams && this.navParams.get('image') ) {
      this.image = this.navParams.get('image')
    } else {
      this.image = null
    }
  }

  play() {
    this.streamingMedia.play()
  }

  pause() {
    this.streamingMedia.pause()
  }

  forward() {
    this.streamingMedia.playNext()
  }

  seek() {
    console.log("seek to: " + this.progress)
    this.streamingMedia.seek(this.progress)
  }

  collapse() {
    this.image = null;
  }

  close() {
    this.streamingMedia.cleanup()
    this.viewCtrl.dismiss()
  }
}
