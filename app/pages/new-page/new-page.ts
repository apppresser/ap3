import {Component, ViewChild} from '@angular/core';
import {NavParams} from 'ionic-angular';

@Component({
  templateUrl: 'build/pages/new-page/new-page.html'
})
export class NewPage {

  pages: any;
  constructor( private navParams: NavParams ) {
  	console.log('NewPage loaded');
  }

  ionViewDidEnter() {
  	// this.externalLinks();
  }

  openPage(p) {
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
}
