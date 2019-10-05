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
  currentIndex = 0;
  playlist: any;

  constructor(private streamingMedia: StreamingMedia) {}

  start(item, playlist) {
    this.playlist = playlist;
    // where are we in playlist? song 1, song 5, etc?
    this.currentIndex = this.playlist.findIndex(x => x.source === item.source);

    console.log(this.playlist, this.currentIndex);

    if (!item.source) {
      alert("Error: no media source.");
      return;
    }

    this.playMedia(item);
  }

  playMedia(item) {
    if (item.type.indexOf("audio") >= 0) {
      let options: StreamingAudioOptions = {
        successCallback: () => this.playNext(),
        errorCallback: e => {
          console.log("Error streaming");
        },
        bgImageScale: "fit", // other valid values: "stretch", "aspectStretch"
        initFullscreen: false, // true is default. iOS only.
        keepAwake: false // prevents device from sleeping. true is default. Android only.
      };
      if (item.image) {
        options.bgImage = item.image;
      }

      this.streamingMedia.playAudio(item.source, options);
    } else {
      let options: StreamingVideoOptions = {
        successCallback: () =>  this.playNext(),
        errorCallback: e => {
          console.log("Error streaming");
        },
        shouldAutoClose: false, // true(default)/false
        controls: true // true(default)/false. Used to hide controls on fullscreen
      };

      this.streamingMedia.playVideo(item.source, options);
    }
  }

  playNext() {
    if( !this.currentIndex || this.currentIndex === 0 ) {
      this.currentIndex = 1
    } else {
      this.currentIndex++;
    }
    

    if (this.currentIndex >= this.playlist.length) {
      this.currentIndex = 0;
    }

    console.log(this.playlist[this.currentIndex], this.currentIndex);
    this.playMedia(this.playlist[this.currentIndex]);
  }
}
