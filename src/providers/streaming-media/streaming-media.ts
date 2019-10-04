import { Injectable } from "@angular/core";
import { NavParams } from "ionic-angular";
import {
  StreamingVideoOptions,
  StreamingAudioOptions,
  StreamingMediaOriginal
} from "@ionic-native/streaming-media";

@Injectable()
export class StreamingMediaPlayer {
  source: string;
  image: any;
  title: string = "";
  type: any;

  constructor(
    private streamingMedia: StreamingMediaOriginal,
    public navParams: NavParams
  ) {}

  start( data ) {
    if( !data.source ) {
      alert("Error: no media source.")
      return;
    }
    if( data.type.indexOf('audio') >= 0 ) {

      let options: StreamingAudioOptions = {
        successCallback: () => { console.log('Video played') },
        errorCallback: (e) => { console.log('Error streaming') },
        bgImageScale: "fit", // other valid values: "stretch", "aspectStretch"
        initFullscreen: false, // true is default. iOS only.
        keepAwake: false, // prevents device from sleeping. true is default. Android only.
      };
      if( data.image ) {
        options.bgImage = data.image
      }
      this.streamingMedia.playAudio( data.source, options )

    } else {
      let options: StreamingVideoOptions = {
        successCallback: () => { console.log('Video played') },
        errorCallback: (e) => { console.log('Error streaming') },
        shouldAutoClose: false,  // true(default)/false
        controls: true // true(default)/false. Used to hide controls on fullscreen
      };

      this.streamingMedia.playVideo( data.source, options )
    }
    
  }
}
