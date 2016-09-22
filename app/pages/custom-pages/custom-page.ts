import {Component, ViewChild} from '@angular/core';
import {NavParams, Slides} from 'ionic-angular';
import {InnerContent} from '../../directives/inner-content/inner-content';

@Component({
  templateUrl: 'build/pages/custom-pages/custom-page.html',
  directives: [InnerContent]
})
export class CustomPage {

  pageHTML: any;
  dynamic: string;

  constructor(public navParams: NavParams ) {
    console.log(navParams);
    let template = navParams.data.slug;
    this.pageHTML = ['build/pages/custom-pages/' + template + '.html', [InnerContent] ];
  }

}