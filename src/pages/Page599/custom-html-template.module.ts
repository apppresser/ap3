import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { Page599 } from './custom-html-template';

@NgModule({
  declarations: [
    Page599,
  ],
  imports: [
    IonicPageModule.forChild(Page599),
    TranslateModule.forChild()
  ],
  entryComponents: [
    Page599
  ],
  exports: [
    Page599
  ]
})
export class Page599Module {}
