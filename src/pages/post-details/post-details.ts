import {NavController, NavParams, ModalController} from 'ionic-angular';
import {Component, Renderer} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {SocialSharing} from 'ionic-native';

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
    public modalCtrl: ModalController,
    public renderer: Renderer
    ) {
    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = navParams.get('item');

    this.content = sanitizer.bypassSecurityTrustHtml( this.selectedItem.content.rendered );

    // let listenFunc = renderer.listenGlobal( '#app-media', 'click', (event) => {
    //   console.log(event);
    //   alert('Element clicked');
    // });
  }

  ionViewDidLoad() {

  }

  mediaModal( src, img = null ) {

    let modal = this.modalCtrl.create(MediaPlayer, {source: src, image: img});
    modal.present();

  }

  share() {
    console.log( this.selectedItem.title.rendered, this.selectedItem.link );

    SocialSharing.share( this.selectedItem.title.rendered, null, null, this.selectedItem.link ).then(() => {
      // Sharing via email is possible
    }).catch(() => {
      // Sharing via email is not possible
    });

  }

}
