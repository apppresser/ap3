import { Injectable, SecurityContext } from "@angular/core";
import { Platform } from "ionic-angular";
import { File } from "@ionic-native/file";
import { InAppBrowser } from "@ionic-native/in-app-browser";
import { Device } from "@ionic-native/device";
import { FileOpener } from "@ionic-native/file-opener";

/*
 * How PDFs are handled:
 * If it is a remote file, we link out to the system browser. For Android, it uses Google Reader, iOS just uses Safari.
 * If it is a local file, we open with the device's PDF application.
 *
 */
@Injectable()
export class PdfService {
  constructor(
    public file: File,
    public iab: InAppBrowser,
    public device: Device,
    private fileOpener: FileOpener,
    public platform: Platform
  ) {}

  openPdf(src) {
    // handle remote files in browser
    if (src.indexOf("http") >= 0) {
      if (this.platform.is("android")) {
        window.open(
          "https://drive.google.com/viewerng/viewer?url=" + src,
          "_system"
        );
      } else {
        window.open(src, "_system");
      }
    } else {
      this.handleLocalPdf(src);
    }
  }

  handleLocalPdf(src) {
    if (this.platform.is("android")) {

        this.handleAndroidLocal(src)

    } else {

      if (src.indexOf("file://") < 0) {
        // relative url, need to make it absolute
        src = this.file.applicationDirectory + "www/" + src;
      }

      this.useFileOpener(src)
    }
  }

  handleAndroidLocal(source) {

    // if the file is already on the local system, don't mess with the url. This is probably from the downloads list
    if( source.indexOf('file://') >= 0 ) {
      this.useFileOpener(source)
    } else {

      // if the file is in our assets or application directory, move it to a public folder so it can be opened by a pdf app
      this.maybeCopyFile(source)
      .then((res:string) => {

        this.useFileOpener(res)

      })
      .catch(err => {
        console.warn(err);
      });
    }
     
  }

  useFileOpener(src) {

    this.fileOpener
        .open(src, "application/pdf")
        .then(() => { /* success */ })
        .catch(e => console.warn("Error opening file after copying", e));
  }

  // local files on Android don't work from assets folder, so we have to copy them to the app storage
  maybeCopyFile(source) {
    return new Promise((resolve, reject) => {
      let assetPath = this.file.applicationDirectory + "www/" + source;
      console.log(assetPath);

      //first - resolve target path in bundled file structure:
      this.file
        .resolveLocalFilesystemUrl(assetPath)
        .then((entry: any) => {
          let wwwFile = entry.toInternalURL();
          console.log("target entry: " + entry + ", - wwwFile: " + wwwFile);

          //then - resolve save folder in dataDirectory:
          this.file
            .resolveLocalFilesystemUrl(this.file.externalDataDirectory)
            .then((entry: any) => {
              let savePath = entry.toInternalURL();
              console.log("save entry: " + entry + ", - savePath: " + savePath);
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
                  console.log("File copied, entry.toURL(): " + newPath);

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
}
