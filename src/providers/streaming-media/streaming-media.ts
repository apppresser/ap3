import { Injectable } from "@angular/core";
import {
  StreamingVideoOptions,
  StreamingMedia
} from "@ionic-native/streaming-media";
import { File } from "@ionic-native/file";
import { Device } from "@ionic-native/device";
import { Media, MediaObject } from "@ionic-native/media";
import { Events, LoadingController } from "ionic-angular";

@Injectable()
export class StreamingMediaPlayer {
  source: string;
  image: any;
  title: string = "";
  type: any;
  currentIndex = 0;
  playlist: any = null;
  currentTrack: MediaObject;
  progress: any;
  durationInterval: any;
  duration: any = null;

  constructor(
    private streamingMedia: StreamingMedia,
    private file: File,
    public device: Device,
    private media: Media,
    public events: Events,
    public loadingCtrl: LoadingController
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
    if ( !this.device || typeof this.device.platform != 'string' ) {
      alert("Please try from a device.");
      return;
    }

    this.cleanup()

    item.type = this.getMimeType(item.source);

    if (item.type.indexOf("audio") >= 0) {
      this.events.publish("show_audio_player", item);

      (<MediaObject>this.currentTrack) = this.media.create(item.source);
      this.currentTrack.onSuccess.subscribe(() => {
        console.log("Play is successful");
        // this.playNext();
      });

      this.currentTrack.play();

      this.doProgress();
    } else {
      let options: StreamingVideoOptions = {
        successCallback: () => {
          console.log("Video success");
        },
        errorCallback: e => {
          console.log("Error streaming");
        },
        shouldAutoClose: true, // true(default)/false
        controls: true // true(default)/false. Used to hide controls on fullscreen
      };

      this.events.publish("close_audio_player");

      this.streamingMedia.playVideo(item.source, options);
    }
  }

  getDur() {
    // @TODO consider adding a loader until audio starts to play and duration is available
    // (check constantly for the cordova media plugin updates, beacuse there are pull requests that have already fixed this)
    return new Promise(resolve => {
      this.durationInterval = setInterval(() => {
        var dur = this.currentTrack.getDuration();
        if (dur > 0) {
          clearInterval(this.durationInterval);
          this.duration = dur;
          resolve(dur);
        }
      }, 100);
    });
  }

  doProgress() {
    this.getDur().then(duration => {

      var dur = duration;

      this.progress = setInterval(() => {

        // get media position
        this.currentTrack.getCurrentPosition()
          .then(position => {

            if (position > -1) {

              let percentCompleted =
                parseInt(position) / parseInt(<any>dur);
              percentCompleted = Math.floor(percentCompleted * 100);

              this.events.publish("audio_player_progress", percentCompleted);
            }
          })
          .catch(e => {
            console.log("Error getting pos=" + e);
          });
      }, 1000);
    });
  }

  pause() {
    if (this.currentTrack) this.currentTrack.pause();
  }

  stop() {
    if (this.currentTrack) this.currentTrack.stop();
  }

  play() {
    if (this.currentTrack) this.currentTrack.play();
  }

  seek(num) {
    if (!this.currentTrack || !this.duration) return;
    // num is integer between 1 - 100
    // turn that into a percent num / 100
    let percent = num / 100;
    // get track duration in milliseconds dur * 1000
    let durMil = this.duration * 1000;
    // percent * duration = seekMil
    let seekMil = percent * durMil; // milliseconds to seek to

    this.currentTrack.seekTo(seekMil);
  }

  getSource(item) {
    return new Promise((resolve, reject) => {
      item.type = this.getMimeType(item.source);

      if( item.source.indexOf('http') >= 0 ) {
        // remote file, don't do anything with url
        resolve( item.source )
      } else if ( item.type.indexOf("audio") >= 0 ) {
        // local audio files need special handling
        let src;

        if( item.source.indexOf("file://") >= 0 ) {
          // already an absolute local url
          src = item.source
        } else {
          // relative url, need to make it absolute
          src = this.file.applicationDirectory + "www/" + item.source
        }

        this.file
        .resolveLocalFilesystemUrl(
          src
        )
        .then(dir => {
          // this will return a url starting with cdvfile://
          resolve(dir.toInternalURL());
        });
      } else if (item.type.indexOf("video") >= 0 && item.source.indexOf('file://') < 0 ) {

        if( this.device.platform.toLowerCase() === "android" ) {
          var loading = this.loadingCtrl.create();
  
          loading.present();

          this.maybeCopyFile(item)
          .then(source => {
            resolve(source);
          })
          .catch(err => {
            console.warn("maybe copy file error", err);
            reject(err);
          }).then( () => {
            loading.dismiss()
          })
          
        } else {
          resolve(this.file.applicationDirectory + "www/" + item.source);
        }
        
      } else {
        // probably here because file is already downloaded. This happens on media list downloads.
        resolve( item.source )
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

    this.playMedia(this.playlist[this.currentIndex]);
  }

  playPrevious() {
    if (!this.playlist) return;

    if (!this.currentIndex || this.currentIndex === 0) {
      this.currentIndex = 1;
    } else {
      this.currentIndex--;
    }

    if (this.currentIndex <= -1) return;

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
          let wwwFile = entry.toInternalURL();
          //console.log("target entry: " + entry + ", - wwwFile: " + wwwFile);

          //then - resolve save folder in dataDirectory:
          this.file
            .resolveLocalFilesystemUrl(this.file.dataDirectory)
            .then((entry: any) => {
              let savePath = entry.toInternalURL();
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
                  reject(error);
                });
            })
            .catch(error => {
              console.log(
                "error this.file.resolveLocalFilesystemUrl (save folder): ",
                error
              );
              reject(error);
            });
        })
        .catch(error => {
          console.log(
            "error this.file.resolveLocalFilesystemUrl (target): ",
            error
          );
          reject(error);
        });
    });
  }

  // when audio player is closed, kill all processes
  cleanup() {
    if (this.currentTrack) {
      this.currentTrack.stop();
      this.currentTrack.release();
      this.duration = null;
      this.events.publish('audio_player_expand_collapse')
    }

    clearInterval(this.progress);
    clearInterval(this.durationInterval);
  }
}
