import { Component, ViewChild } from '@angular/core';
import { Events, ViewController, LoadingController, IonicPage, ToastController, NavParams, ModalController, Platform, Slides } from 'ionic-angular';
import {Storage} from '@ionic/storage';
import {TranslateService} from '@ngx-translate/core';

@IonicPage()
@Component({
  selector: 'woo-modal',
  templateUrl: 'woo-modal.html'
})
export class WooModal {

	@ViewChild(Slides) slides: Slides;

	variations: any;
	filteredVariations: any;
	attributes: any;
	title: string;
	noResults: boolean = false;

	constructor(
		public navParams: NavParams,
		public viewCtrl: ViewController,
		public loadingCtrl: LoadingController,
		public events: Events,
		public storage: Storage,
		public translate: TranslateService,
		private toastCtrl: ToastController,
		public modalCtrl: ModalController,
		public platform: Platform
		) {
      
		if(this.navParams.get('variations')) {
			this.variations = this.navParams.get('variations');
			this.filteredVariations = this.variations
		} else {
			alert("No variations to show.")
			this.viewCtrl.dismiss()
		}

		if(this.navParams.get('attributes')) {
			this.attributes = this.navParams.get('attributes');
		}

		this.translate.get("Choose Options").subscribe( text => {
			this.title = text
		})

	}

	ngAfterViewInit() {
	    this.slides.freeMode = true;
	    this.slides.slidesPerView = 2;
	}

	resetOptions() {
		this.filteredVariations = this.variations
		this.attributes = this.navParams.get('attributes');

		for (let i = 0; i < this.attributes.length; ++i) {
			this.attributes[i].disabled = false
		}
	}

	attributeChanged( name, attribute ) {
		console.log(name, attribute)
		this.noResults = false
		// find variations with this attribute in them, and filter

		let getVariations = this.filteredVariations.filter( variation => JSON.stringify( variation.attributes ).indexOf( name ) >= 0 )

		// if there are no results, we don't want to wipe the array, just display a notice
		if( !getVariations.length ) {
			this.noResults = true
		} else {
			attribute.disabled = true
			this.filteredVariations = getVariations
		}
	}

	variationSelected( variation ) {
		console.log(variation)
		this.viewCtrl.dismiss(variation)
		this.resetOptions()
	}

	dismiss() {
		this.resetOptions()
		this.viewCtrl.dismiss()
	}

}