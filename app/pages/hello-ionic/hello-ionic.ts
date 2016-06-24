import {Component} from '@angular/core';
import {Modal, NavController, ViewController} from 'ionic-angular';
import {AppModal} from '../app-modal/app-modal';

@Component({
  templateUrl: 'build/pages/hello-ionic/hello-ionic.html'
})
export class HelloIonicPage {
  constructor(private nav: NavController) {
   this.nav = nav;
 }

  showModal() {
    let photoModal = Modal.create(AppModal, { userId: 8675309 });
	  this.nav.present(photoModal);
  }

}