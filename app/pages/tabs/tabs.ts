import {Component} from '@angular/core';
import {Page, NavParams} from 'ionic-angular';
import {NewPage} from '../new-page/new-page';
import {ListPage} from '../list/list';
import {PostList} from '../post-list/post-list';

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
