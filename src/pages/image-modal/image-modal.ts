import { Component, ViewChild } from '@angular/core';
import { ViewController, IonicPage, NavParams, ModalController } from 'ionic-angular';
import { Slides } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'image-modal',
  templateUrl: 'image-modal.html'
})
export class ImageModal {

	@ViewChild(Slides) slides: Slides;

	imgSrc: any;

	constructor(
		public viewCtrl: ViewController,
		public navParams: NavParams
	){
		this.imgSrc = this.navParams.get('src');
	}

	ngAfterViewInit() {
		this.slides.zoom = true;
	}

	dismiss( data = null ) {
		this.viewCtrl.dismiss( data );
	}
}