import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { BpGroupPage } from './bp-group';
import { SanitizeHtmlModule } from '../../pipes/sanitize-html/sanitize-html.module';

@NgModule({
  declarations: [
    BpGroupPage,
  ],
  imports: [
    IonicPageModule.forChild(BpGroupPage),
    TranslateModule.forChild(),
    SanitizeHtmlModule
  ],
  exports: [
    BpGroupPage
  ]
})
export class BpGroupPageModule {}
