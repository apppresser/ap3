import {NavController, NavParams} from 'ionic-angular';
import {Component} from '@angular/core';

@Component({
  templateUrl: 'build/pages/post-details/post-details.html'
})
export class PostDetailsPage {
  selectedItem: any;

  constructor(private nav: NavController, navParams: NavParams) {
    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = navParams.get('item');
  }

  onPageDidEnter() {
	  // Anything that needs to run everytime the view is entered will go here
	  console.log( this.selectedItem );
  }
}
