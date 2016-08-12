import {Component} from '@angular/core';
import {ModalController} from 'ionic-angular';
import {AppModal} from '../app-modal/app-modal';

@Component({
  templateUrl: 'build/pages/hello-ionic/hello-ionic.html'
})
export class HelloIonicPage {
  constructor(private modalController : ModalController) {
 }

  showModal() {
    let photoModal = this.modalController.create(AppModal, { userId: 8675309 });
	  photoModal.present(photoModal);
  }

}