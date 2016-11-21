import {NavController, NavParams, ModalController} from 'ionic-angular';
import {Component} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';

import {MediaPlayer} from '../media-player/media-player';

@Component({
  templateUrl: 'post-details.html'
})
export class PostDetailsPage {
  selectedItem: any;
  content: any;

  constructor(
    public nav: NavController, 
    navParams: NavParams, 
    public sanitizer: DomSanitizer,
    public modalCtrl: ModalController
    ) {
    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = navParams.get('item');

    this.content = sanitizer.bypassSecurityTrustHtml( this.selectedItem.content.rendered );
  }

  ionViewDidLoad() {

  }

  mediaModal( src, img = null ) {

    let modal = this.modalCtrl.create(MediaPlayer, {source: src, image: img});
    modal.present();

  }

}
