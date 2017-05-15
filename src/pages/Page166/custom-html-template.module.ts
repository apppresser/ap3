import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { Page166 } from './custom-html-template';

@NgModule({
  declarations: [
    Page166,
  ],
  imports: [
    IonicPageModule.forChild(Page166),
    TranslateModule.forChild()
  ],
  entryComponents: [
    Page166
  ],
  exports: [
    Page166
  ]
})
export class Page166Module {}
