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
  duration: any = null;
  position: any = null;

  constructor( public navParams: NavParams, public viewCtrl: ViewController, public streamingMedia: StreamingMediaPlayer, public events: Events ) {

    this.events.subscribe("audio_player_progress", object => {
      
      this.progress = object.percent;

      if( object.duration )
        this.duration = this.numToTime( object.duration );

      if( object.position )
        this.position = this.numToTime( object.position );
    });

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

  // convert a number to time
  numToTime( int ) {

    let sec_num = parseInt(int, 10); // don't forget the second param
    let hours   = Math.floor(sec_num / 3600);
    let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds = sec_num - (hours * 3600) - (minutes * 60);
    let hourString = '';
    let minuteString = '';
    let secondString = '';

    if( hours === 0 ) {
      // dont show hours
    } else if (hours > 10 ) { 
      hourString = hours.toString() + ":"; 
    } else if (hours < 10) { 
      hourString = "0" + hours + ":";
    }

    if (minutes < 10) { 
      minuteString = "0" + minutes + ":"; 
    } else {
      minuteString = minutes.toString() + ":";
    }

    if (seconds < 10) { 
      secondString = "0" + seconds; 
    } else {
      secondString = seconds.toString();
    }

    return hourString + minuteString + secondString;

  }

}
