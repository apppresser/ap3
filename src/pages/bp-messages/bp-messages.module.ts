import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { BpMessages } from './bp-messages';
import { DoLinksModule } from '../../pipes/do-links/do-links.module';

@NgModule({
  declarations: [
    BpMessages,
  ],
  imports: [
    IonicPageModule.forChild(BpMessages),
    TranslateModule.forChild(),
    DoLinksModule
  ],
  exports: [
    BpMessages
  ]
})
export class BpMessagesModule {}