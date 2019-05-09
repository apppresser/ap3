import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { WooModal } from './woo-modal';

@NgModule({
  declarations: [
    WooModal,
  ],
  imports: [
    IonicPageModule.forChild(WooModal),
    TranslateModule.forChild()
  ],
  exports: [
    WooModal
  ]
})
export class WooModalModule {}