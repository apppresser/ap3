import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { BpDetailsPage } from './bp-details';
import { SanitizeHtmlModule } from '../../pipes/sanitize-html/sanitize-html.module';

@NgModule({
  declarations: [
    BpDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(BpDetailsPage),
    TranslateModule.forChild(),
    SanitizeHtmlModule
  ],
  exports: [
    BpDetailsPage
  ]
})
export class BpDetailsPageModule {}
