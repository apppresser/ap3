import {Component} from '@angular/core';
import {Page, NavParams} from 'ionic-angular';

@Component({
  templateUrl: 'build/pages/tabs/tabs.html'
})
export class TabsPage {
  tabs: any;
  mySelectedIndex: number;

  constructor(navParams: NavParams) {
    this.mySelectedIndex = navParams.data.tabIndex || 0;
    this.tabs = navParams.data;
  }

}
