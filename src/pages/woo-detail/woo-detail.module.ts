import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WooDetail } from './woo-detail';

@NgModule({
  declarations: [
    WooDetail,
  ],
  imports: [
    IonicPageModule.forChild(WooDetail),
  ],
})
export class WooDetailModule {}
