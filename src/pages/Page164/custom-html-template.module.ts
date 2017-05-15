import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { Page164 } from './custom-html-template';

@NgModule({
  declarations: [
    Page164,
  ],
  imports: [
    IonicPageModule.forChild(Page164),
    TranslateModule.forChild()
  ],
  entryComponents: [
    Page164
  ],
  exports: [
    Page164
  ]
})
export class Page164Module {}
