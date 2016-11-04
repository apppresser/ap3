import {Component} from '@angular/core';
import {NavParams} from 'ionic-angular';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  tabs: any;
  mySelectedIndex: number;

  constructor(navParams: NavParams) {
  	console.log('tabs navparams', navParams);
    this.mySelectedIndex = navParams.data.tabIndex || 0;
    this.tabs = navParams.data;
  }

}
