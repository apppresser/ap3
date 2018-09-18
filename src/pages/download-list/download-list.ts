import {Component} from '@angular/core';
import {NavParams, ViewController, ToastController, IonicPage, ModalController} from 'ionic-angular';
import {Storage} from '@ionic/storage';
import {File} from '@ionic-native/file';
import { TranslateService } from '@ngx-translate/core';

declare var cordova: any;

@IonicPage()
@Component({
  templateUrl: 'download-list.html',
  selector: 'download-list'
})
export class DownloadList {

  downloads: any
  title: string

  constructor( 
    public navParams: NavParams,
    public storage: Storage,
    public viewCtrl: ViewController,
    public toastCtrl: ToastController,
    public modalCtrl: ModalController,
    private file: File,
    private translate: TranslateService
    ) {

    if(this.navParams.get('title')) {
      this.title = this.navParams.get('title');
    } else {
      this.translate.get('Downloads').subscribe( text => {
        this.title = text;
      });
    }
      
  }

  ionViewWillEnter() {
    this.getDownloads()
  }

  // first get existing checked segments
  getDownloads() {
  
    this.storage.get( 'downloads' ).then( downloadList => {

      this.downloads = downloadList

    })
    
  }

  mediaModal( item ) {

    let modal = this.modalCtrl.create('MediaPlayer', {source: item.url });
    modal.present();

  }

  removeDownload( item ) {

    let path = cordova.file.dataDirectory + 'media/';
    let fileName = item.url.replace(/^.*[\\\/]/, '');

    this.file.removeFile( path, fileName ).then( msg => {

      this.removeDownloadSuccess( item )

      }, (error) => {

        console.warn(error)

        // still remove data if file not found
        if( error.code == 1 ) {
          this.removeDownloadSuccess( item )
        }

    })

  }

  removeDownloadSuccess( item ) {

    // remove from downloads and delete file
    for (let i = this.downloads.length - 1; i >= 0; i--) {
      if( this.downloads[i].url === item.url ) {
        this.downloads.splice(i, 1);
        break;
      }
    }

    this.storage.set( 'downloads', this.downloads )

    this.presentToast('Download Removed');

  }

  presentToast(msg) {

    let toast = this.toastCtrl.create({
      message: msg,
      duration: 5000,
      position: 'bottom'
    });

    toast.present();

  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}