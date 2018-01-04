import {Component, OnInit} from '@angular/core';
import {NavParams, IonicPage} from 'ionic-angular';

@IonicPage()
@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage implements OnInit {
  tabs: Array<any> = [];
  mySelectedIndex: number;

  constructor(
    private navParams: NavParams
  ) {}

  ngOnInit() {
    this.mySelectedIndex = this.navParams.data.tabIndex || 0;

    // root=null if opening in the IAB
    for(let tab of this.navParams.data) {
      let target = this.maybeOpenIAB(tab);
      if(target) {
        tab.root = null;
        tab.target = target;
      }
      this.tabs.push(tab);
    }
  }

  onIonSelect($event, tab) {
    if(tab.url && tab.target) {
      this.openIab(tab.url, tab.target);
    }
  }

  maybeOpenIAB(tab) {

    if (
      tab.extra_classes &&
      (tab.extra_classes.indexOf('system') >= 0 || tab.extra_classes.indexOf('external') >= 0) &&
      tab.url &&
      tab.url.indexOf('http') === 0
    ) {
      return this.getIabTarget(tab.extra_classes);
    }

    return false;
  }

  getIabTarget(extra_classes) {
    if(extra_classes.indexOf('system') >= 0) {
      return '_system';
    } else if(extra_classes.indexOf('external') >= 0) {
      return '_blank';
    }
    return false;
  }

  openIab( link, target, options = null ) {
    
    window.open(link, target, options );

  }

}
