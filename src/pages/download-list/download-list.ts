import { Component } from "@angular/core";
import { Device } from "@ionic-native/device";
import {
  NavParams,
  ViewController,
  ToastController,
  IonicPage,
  ModalController
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import { File } from "@ionic-native/file";
import { TranslateService } from "@ngx-translate/core";
import { StreamingMediaPlayer } from "../../providers/streaming-media/streaming-media";

declare var cordova: any;

@IonicPage()
@Component({
  templateUrl: "download-list.html",
  selector: "download-list"
})
export class DownloadList {
  downloads: any;
  title: string;

  constructor(
    public navParams: NavParams,
    public device: Device,
    public storage: Storage,
    public viewCtrl: ViewController,
    public toastCtrl: ToastController,
    public modalCtrl: ModalController,
    private file: File,
    private translate: TranslateService,
    public streamingMediaPlayer: StreamingMediaPlayer
  ) {
    if (this.navParams.get("title")) {
      this.title = this.navParams.get("title");
    } else {
      this.translate.get("Downloads").subscribe(text => {
        this.title = text;
      });
    }
  }

  ionViewWillEnter() {
    this.getDownloads();
  }

  ionSelected() {
    this.getDownloads();
  }

  // first get existing checked segments
  getDownloads() {
    this.storage.get("downloads").then(downloadList => {
      this.downloads = downloadList;
    });
  }

  mediaModal(item) {
    // check if this is a pdf, handle differently
    let url = item.url || item.media_url;
    let fileExt = url.split(".").pop();

    if (fileExt === "pdf") {
      this.handlePDF(item);
    } else {
      this.streamingMediaPlayer.start(item, this.downloads);
    }
  }

  handlePDF(item) {
    let modal = this.modalCtrl.create("PdfModal", item);
    modal.present();
  }

  removeDownload(item) {
    let path = cordova.file.dataDirectory + "media/";
    let fileName = item.url.replace(/^.*[\\\/]/, "");

    this.file.removeFile(path, fileName).then(
      msg => {
        this.removeDownloadSuccess(item);
      },
      error => {
        console.warn(error);

        // still remove data if file not found
        if (error.code == 1) {
          this.removeDownloadSuccess(item);
        }
      }
    );
  }

  removeDownloadSuccess(item) {
    // remove from downloads and delete file
    for (let i = this.downloads.length - 1; i >= 0; i--) {
      if (this.downloads[i].url === item.url) {
        this.downloads.splice(i, 1);
        break;
      }
    }

    this.storage.set("downloads", this.downloads);

    this.translate.get("Download Removed").subscribe(text => {
      this.presentToast(text);
    });
  }

  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 5000,
      position: "bottom"
    });

    toast.present();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
