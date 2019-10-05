import { Injectable } from "@angular/core";
import {
  StreamingVideoOptions,
  StreamingAudioOptions,
  StreamingMedia
} from "@ionic-native/streaming-media";

@Injectable()
export class StreamingMediaPlayer {
  source: string;
  image: any;
  title: string = "";
  type: any;

  constructor(
    private streamingMedia: StreamingMedia
  ) {}

  start( data ) {
    if( !data.source ) {
      alert("Error: no media source.")
      return;
    }
    if( data.type.indexOf('audio') >= 0 ) {

      let options: StreamingAudioOptions = {
        successCallback: () => { console.log('Audio played') },
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
