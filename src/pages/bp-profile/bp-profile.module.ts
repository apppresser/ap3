import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { BpProfilePage } from './bp-profile';
import { SanitizeHtmlModule } from '../../pipes/sanitize-html/sanitize-html.module';

@NgModule({
  declarations: [
    BpProfilePage,
  ],
  imports: [
    IonicPageModule.forChild(BpProfilePage),
    TranslateModule.forChild(),
    SanitizeHtmlModule
  ],
  exports: [
    BpProfilePage
  ]
})
export class BpProfilePageModule {}
