import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { BpMessages } from './bp-messages';

@NgModule({
  declarations: [
    BpMessages,
  ],
  imports: [
    IonicPageModule.forChild(BpMessages),
    TranslateModule.forChild()
  ],
  exports: [
    BpMessages
  ]
})
export class BpMessagesModule {}