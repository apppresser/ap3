import { Component } from "@angular/core";
import { NavParams, ViewController, Events } from "ionic-angular";
import {StreamingMediaPlayer} from '../../providers/streaming-media/streaming-media';

@Component({
  selector: "audio-player",
  templateUrl: "audio-player.html"
})
export class AudioPlayerComponent {

  progress: any = null;
  image: any = null;
  playerExpanded: boolean = true;
  title: string = null;

  constructor( public navParams: NavParams, public viewCtrl: ViewController, public streamingMedia: StreamingMediaPlayer, public events: Events ) {

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

    if( this.navParams && this.navParams.get('title') ) {
      this.title = this.navParams.get('title')
    } else {
      this.title = null
    }

  }

  play() {
    this.streamingMedia.play()
  }

  pause() {
    this.streamingMedia.pause()
  }

  back() {
    this.streamingMedia.playPrevious()
  }

  forward() {
    this.streamingMedia.playNext()
  }

  expand() {
    this.playerExpanded = true;
    this.events.publish('audio_player_expand_collapse')
  }

  seek() {
    this.streamingMedia.seek(this.progress)
  }

  collapse() {
    this.playerExpanded = false;
    this.events.publish('audio_player_expand_collapse', { collapse: true })
  }

  close() {
    this.streamingMedia.cleanup()
    this.viewCtrl.dismiss()
  }
}
