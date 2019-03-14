import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { LdDetailPage } from './ld-detail';
import { SanitizeHtmlModule } from '../../pipes/sanitize-html/sanitize-html.module';

@NgModule({
  declarations: [
    LdDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(LdDetailPage),
    TranslateModule.forChild(),
    SanitizeHtmlModule
  ],
  exports: [
    LdDetailPage
  ]
})
export class LdDetailPageModule {}
