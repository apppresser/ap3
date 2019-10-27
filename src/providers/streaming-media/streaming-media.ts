import { Injectable } from "@angular/core";
import {
  StreamingVideoOptions,
  StreamingAudioOptions,
  StreamingMedia
} from "@ionic-native/streaming-media";
import { File } from "@ionic-native/file";
import { Device } from "@ionic-native/device";
import { Media, MediaObject } from '@ionic-native/media';
import { Events } from "ionic-angular";

@Injectable()
export class StreamingMediaPlayer {
  source: string;
  image: any;
  title: string = "";
  type: any;
  currentIndex = 0;
  playlist: any;
  currentTrack: any;

  constructor(
    private streamingMedia: StreamingMedia,
    private file: File,
    public device: Device,
    private media: Media,
    public events: Events
  ) {}

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

    item.type = this.getMimeType(item.source);

    // handle local file paths
    this.getSource(item)
      .then(source => {
        item.source = source;
        this.playMedia(item);
      })
      .catch(err => {
        console.warn(err);
        alert("Unable to play file.");
      });
  }

  playMedia(item) {
    if (!this.device) {
      alert("Please try from a device.");
      return;
    }

    console.log('play media', item)

    if (item.type.indexOf("audio") >= 0) {

      this.events.publish( "toggle_audio_player", { audio: item, playlist: this.playlist } );

      (<MediaObject>this.currentTrack) = this.media.create(item.source);
      this.currentTrack.onSuccess.subscribe(() => {
        console.log('Play is successful')
        this.playNext()
      });

      this.currentTrack.play();

      

      // let options: StreamingAudioOptions = {
      //   successCallback: () => {
      //     console.log('success callback')
      //     this.playNext()
      //   },
      //   errorCallback: e => {
      //     console.log("Error streaming");
      //   },
      //   bgImageScale: "fit", // other valid values: "stretch", "aspectStretch"
      //   initFullscreen: false, // true is default. iOS only.
      //   keepAwake: false // prevents device from sleeping. true is default. Android only.
      // };
      // if (item.image) {
      //   options.bgImage = item.image;
      // }

      // this.streamingMedia.playAudio(item.source, options);

    } else {

      let options: StreamingVideoOptions = {
        successCallback: () => {
          console.log('Video success')
        },
        errorCallback: e => {
          console.log("Error streaming");
        },
        shouldAutoClose: true, // true(default)/false
        controls: true // true(default)/false. Used to hide controls on fullscreen
      };

      this.streamingMedia.playVideo(item.source, options);
    }
  }

  pause() {
    if( this.currentTrack ) this.currentTrack.pause()
  }

  stop() {
    if( this.currentTrack ) this.currentTrack.stop()
  }

  play() {
    if( this.currentTrack ) this.currentTrack.play()
  }

  getSource(item) {
    return new Promise((resolve, reject) => {

      if (item.source.indexOf("assets") >= 0) {

        // only move file on android
        if (this.device.platform.toLowerCase() === "ios") {
          resolve( this.file.applicationDirectory + "www/" + item.source)
        } else if (this.device.platform.toLowerCase() === "android") {
          this.maybeCopyFile(item)
            .then(source => {
              resolve(source);
            })
            .catch(err => {
              console.warn("maybe copy file error", err);
              reject(err);
            });
        }

      } else {
        resolve(item.source)
      }
    });
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

  // local files on Android don't work from assets folder, so we have to copy them to the app storage
  maybeCopyFile(item) {
    return new Promise((resolve, reject) => {
      let assetPath = this.file.applicationDirectory + "www/" + item.source;

      //first - resolve target path in bundled file structure:
      this.file
        .resolveLocalFilesystemUrl(assetPath)
        .then((entry: any) => {
          let wwwFile = entry.toURL();
          //console.log("target entry: " + entry + ", - wwwFile: " + wwwFile);

          //then - resolve save folder in dataDirectory:
          this.file
            .resolveLocalFilesystemUrl(this.file.dataDirectory)
            .then((entry: any) => {
              let savePath = entry.toURL();
              //console.log("save entry: " + entry + ", - savePath: " + savePath);
              //then - copy file to saveFolder
              let fileName = wwwFile.split("/").pop();

              this.file
                .copyFile(
                  this.file.applicationDirectory + "www/assets/",
                  fileName,
                  savePath,
                  fileName
                )
                .then((entry: any) => {
                  let newPath = entry.toURL();
                  // console.log("File copied, entry.toURL(): " + newPath);

                  resolve(newPath);
                })
                .catch(error => {
                  console.log("error copyFile: ", error);
                  reject(error)
                });
            })
            .catch(error => {
              console.log(
                "error resolveLocalFilesystemUrl (save folder): ",
                error
              );
              reject(error)
            });
        })
        .catch(error => {
          console.log("error resolveLocalFilesystemUrl (target): ", error);
          reject(error)
        });
    });
  }
}
