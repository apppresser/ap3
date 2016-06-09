import {Component} from '@angular/core';
import {ActionSheet, Nav} from 'ionic-angular';

@Component({
  templateUrl: 'build/pages/new-page/new-page.html'
})
export class NewPage {
  constructor( public nav: Nav ) {
  	console.log('NewPage loaded');
  }

  presentActionSheet() {
	  let actionSheet = ActionSheet.create({
		  title: 'Modify your album',
		  buttons: [
			  {
				  text: 'Destructive',
				  role: 'destructive',
				  handler: () => {
					  console.log('Destructive clicked');
				  }
			  }, {
				  text: 'Archive',
				  handler: () => {
					  console.log('Archive clicked');
				  }
			  }, {
				  text: 'Cancel',
				  role: 'cancel',
				  handler: () => {
					  console.log('Cancel clicked');
				  }
			  }
		  ]
	  });
	  this.nav.present(actionSheet);
  }
}
