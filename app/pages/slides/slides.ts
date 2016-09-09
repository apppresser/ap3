import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {NewPage} from '../new-page/new-page';

@Component({
  templateUrl: 'build/pages/slides/slides.html'
})
export class SlidePage {
  slides:any;
  options: any;
  constructor( private nav: NavController ) {
  	this.doSlides();
  }

  doSlides() {
  	// example slides. eventually this will come from API menu item above
	this.slides = [
	{
	  title: "Welcome to your app!",
	  description: "This app is <b>awesome</b> because you built it.",
	  image: "img/ica-slidebox-img-1.png",
	},
	{
	  title: "What is AppPresser?",
	  description: "<b>AppPresser</b> is an app builder that focuses on WordPress integration.",
	  image: "img/ica-slidebox-img-2.png",
	},
	{
	  title: "What is the meaning of life?",
	  description: "Now you're getting personal, you should go outside or eat some mac and cheese.",
	  image: "img/ica-slidebox-img-3.png",
	}
	];

	this.options = {
		pager: true
	};
  }

  nextPage() {
  	this.nav.setRoot(NewPage);
  }

}