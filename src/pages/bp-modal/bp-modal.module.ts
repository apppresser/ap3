import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { BpModal } from './bp-modal';

@NgModule({
  declarations: [
    BpModal,
  ],
  imports: [
    IonicPageModule.forChild(BpModal),
    TranslateModule.forChild()
  ],
  exports: [
    BpModal
  ]
})
export class BpModalModule {}
