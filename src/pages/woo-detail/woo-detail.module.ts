import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WooDetail } from './woo-detail';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    WooDetail,
  ],
  imports: [
    IonicPageModule.forChild(WooDetail),
    TranslateModule.forChild()
  ],
})
export class WooDetailModule {}
