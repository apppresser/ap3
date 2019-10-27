import { Component, Input, ViewChild } from "@angular/core";
import { NavParams, ViewController } from "ionic-angular";
import { Storage } from "@ionic/storage";
import { TranslateService } from "@ngx-translate/core";
import {StreamingMediaPlayer} from '../../providers/streaming-media/streaming-media';

@Component({
  selector: "audio-player",
  templateUrl: "audio-player.html"
})
export class AudioPlayerComponent {
  constructor( public navParams: NavParams, public viewCtrl: ViewController, public streamingMedia: StreamingMediaPlayer ) {
    console.log("audio player constructor", navParams.data);
  }

  ngAfterViewInit() {
  }

  play() {
    this.streamingMedia.play()
  }

  pause() {
    this.streamingMedia.pause()
  }

  stop() {
    this.streamingMedia.stop()
  }

  forward() {
    this.streamingMedia.playNext()
  }

  close() {
    this.viewCtrl.dismiss()
  }
}
