import {Component} from '@angular/core';
import {ViewController, Modal} from 'ionic-angular';
import {AppCamera} from '../../providers/camera/app-camera';

/*
  Generated class for the AppModal page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/app-modal/app-modal.html',
})
export class AppModal {

	constructor(private viewCtrl: ViewController, public appCamera: AppCamera) { 
	}

	close() {
		this.viewCtrl.dismiss();
	}

	camera() {
		this.appCamera.photoLibrary();
	}
}
