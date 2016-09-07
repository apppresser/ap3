import {Component} from '@angular/core';
import {ActionSheetController} from 'ionic-angular';

@Component({
  templateUrl: 'build/pages/new-page/new-page.html'
})
export class NewPage {
  constructor( private actionSheetController: ActionSheetController ) {
  	console.log('NewPage loaded');
  }

  ionViewDidEnter() {
  	this.externalLinks();
  }

  externalLinks() {
    
    let links = document.querySelectorAll("a");

    for( let i = 0; i < links.length; i++ ){
      let res = links[i].href;
      res = res.substring(0, 4);
      if( res === 'http' ) {
        links[i].addEventListener('click', e => {
          e.preventDefault();
          window.open( e.target.href, '_blank' );
        }, false);
      }
    }
  }

  presentActionSheet() {
	  let actionSheet = this.actionSheetController.create({
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
	  actionSheet.present(actionSheet);
  }
}
