import { Injectable } from "@angular/core";
import {
  StreamingVideoOptions,
  StreamingAudioOptions,
  StreamingMedia
} from "@ionic-native/streaming-media";
import { File } from "@ionic-native/file";

@Injectable()
export class StreamingMediaPlayer {
  source: string;
  image: any;
  title: string = "";
  type: any;
  currentIndex = 0;
  playlist: any;

  constructor(private streamingMedia: StreamingMedia, private file: File) {}

  start(item, playlist) {
    if (playlist) {
      this.playlist = playlist;
      // where are we in playlist? song 1, song 5, etc?
      this.currentIndex = this.playlist.findIndex(
        x => x.source === item.source
      );
    }

    if (!item.source) {
      if (item.url) {
        item.source = item.url;
      } else {
        alert("Error: no media source.");
        return;
      }
    }

    this.playMedia(item);
  }

  playMedia(item) {
    item.type = this.getMimeType(item.source);

    // convert assets url to native file path
    if( item.source.indexOf('assets') >= 0 ) {
      item.source = this.file.applicationDirectory + 'www/' + item.source;
      console.log( item.source )
    }

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
        successCallback: () => this.playNext(),
        errorCallback: e => {
          console.log("Error streaming");
        },
        shouldAutoClose: true, // true(default)/false
        controls: true // true(default)/false. Used to hide controls on fullscreen
      };

      this.streamingMedia.playVideo(item.source, options);
    }
  }

  playNext() {
    if (!this.playlist) return;

    if (!this.currentIndex || this.currentIndex === 0) {
      this.currentIndex = 1;
    } else {
      this.currentIndex++;
    }

    if (this.currentIndex >= this.playlist.length) {
      this.currentIndex = 0;
    }

    console.log(this.playlist[this.currentIndex], this.currentIndex);
    this.playMedia(this.playlist[this.currentIndex]);
  }

  /**
   * Tip: we use mimetype to know when to remove/stop autoplay.
   * A PDF can't autoplay, so we don't give it a mimetype.
   * @param mediaUrl
   */
  getMimeType(mediaUrl) {
    if (!mediaUrl) return "";

    let fileExt = mediaUrl.split(".").pop();
    let mimeType = "";

    // .mp3, .m4a, .mov, .mp4
    switch (fileExt) {
      case "mp3":
        mimeType = "audio/mp3";
        break;
      case "mp4":
        mimeType = "video/mp4";
        break;
      case "mov":
        mimeType = "video/quicktime";
        break;
      case "m4a":
        mimeType = "audio/mp4a-latm";
        break;
      default:
        mimeType = "";
        break;
    }

    return mimeType;
  }
}
