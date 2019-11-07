import { Component, SecurityContext } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ViewController
} from "ionic-angular";
import { File } from "@ionic-native/file";
import { DomSanitizer } from "@angular/platform-browser";
import { InAppBrowser } from "@ionic-native/in-app-browser";

@IonicPage()
@Component({
  selector: "pdf-modal",
  templateUrl: "pdf-modal.html"
})
export class PdfModal {

  pdfSrc: any;
  zoom: any = 1;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public file: File,
    private sanitizer: DomSanitizer,
    public iab: InAppBrowser
  ) {}

  ionViewDidLoad() {

    let src = this.navParams.get('url') || this.navParams.get('media_url')

    this.getSource(src).then( source => {
      this.pdfSrc = source
      console.log(this.pdfSrc)
    })

  }

  getSource(src) {

    var source = src

    return new Promise((resolve, reject) => {

      if( source.indexOf('http') >= 0 ) {
        // remote file, don't do anything with url
        resolve( this.sanitizer.sanitize(SecurityContext.URL, source) )
      } else {
        // get local file url

        if( source.indexOf("file://") >= 0 ) {
          // already an absolute local url
          source = source
        } else {
          // relative url, need to make it absolute
          source = this.file.applicationDirectory + "www/" + source
        }

        this.file
        .resolveLocalFilesystemUrl(
          source
        )
        .then(dir => {
          // this will return a url starting with cdvfile://
          resolve(dir.toInternalURL());
        });
      }

    });
  }

  browser() {
    let browser = this.iab.create(this.pdfSrc, "_blank")
  }

  zoomIn() {
    this.zoom = this.zoom + 1
  }

  zoomOut() {
    if( this.zoom > 1 ) {
      this.zoom = this.zoom - 1
    }
  }

  dismiss(data = null) {
    this.viewCtrl.dismiss(data);
  }
}
