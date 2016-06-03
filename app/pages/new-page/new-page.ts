import {Page} from 'ionic-angular';


@Page({
  templateUrl: 'build/pages/new-page/new-page.html'
})
export class NewPage {
  constructor() {
  	console.log('NewPage loaded');
  }

  fart() {
	  alert('phhhhrt');
  }
}
