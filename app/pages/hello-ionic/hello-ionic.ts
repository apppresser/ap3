import {Component} from '@angular/core';
import {Modal, NavController, ViewController} from 'ionic-angular';

@Component({
  templateUrl: 'build/pages/hello-ionic/hello-ionic.html'
})
export class HelloIonicPage {
  constructor(nav: NavController) {
   this.nav = nav;
 }

  showModal() {
	  let profileModal = Modal.create(MyModal);
	  this.nav.present(profileModal);
  }
}

// The template for our modal. Should be in separate file
@Component({
	template: `
  <ion-content padding>
    <h2>I'm a modal!</h2>
    <button (click)="close()">Close</button>
  </ion-content>`
})
class MyModal {
	constructor(private viewCtrl: ViewController) { 
	}

	close() {
		this.viewCtrl.dismiss();
	}
}
    