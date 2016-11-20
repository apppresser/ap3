import {NavController, NavParams} from 'ionic-angular';
import {Component} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  templateUrl: 'post-details.html'
})
export class PostDetailsPage {
  selectedItem: any;
  content: any;

  constructor(
    public nav: NavController, 
    navParams: NavParams, 
    public sanitizer: DomSanitizer
    ) {
    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = navParams.get('item');

    this.content = sanitizer.bypassSecurityTrustHtml( this.selectedItem.content.rendered );
  }

  onPageDidEnter() {
	  // Anything that needs to run everytime the view is entered will go here
	  console.log( this.selectedItem );
  }

}
