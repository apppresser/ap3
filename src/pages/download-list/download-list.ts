import {Component} from '@angular/core';
import {NavParams, ViewController, ToastController, IonicPage, ModalController} from 'ionic-angular';
import {Storage} from '@ionic/storage';

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
    public modalCtrl: ModalController
    ) {

    if(this.navParams.get('title')) {
      this.title = this.navParams.get('title');
    } else {
      this.title = 'Downloads';
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

    // console.log(item)

    let modal = this.modalCtrl.create('MediaPlayer', {source: item.url });
    modal.present();

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