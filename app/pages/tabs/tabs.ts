import {Component} from '@angular/core';
import {Page, NavParams} from 'ionic-angular';
import {NewPage} from '../new-page/new-page';
import {ListPage} from '../list/list';
import {PostList} from '../post-list/post-list';

@Component({
  templateUrl: 'build/pages/tabs/tabs.html'
})
export class TabsPage {
  // set the root pages for each tab
  tab1Root: any = ListPage;
  tab2Root: any = PostList;
  tab3Root: any = NewPage;
  mySelectedIndex: number;

  constructor(navParams: NavParams) {
    this.mySelectedIndex = navParams.data.tabIndex || 0;
  }
}
