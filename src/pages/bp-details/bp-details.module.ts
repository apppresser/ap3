import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { BpDetailsPage } from './bp-details';
import { SanitizeHtmlModule } from '../../pipes/sanitize-html/sanitize-html.module';
import { DoLinksModule } from '../../pipes/do-links/do-links.module';

@NgModule({
  declarations: [
    BpDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(BpDetailsPage),
    TranslateModule.forChild(),
    SanitizeHtmlModule,
    DoLinksModule
  ],
  exports: [
    BpDetailsPage
  ]
})
export class BpDetailsPageModule {}
