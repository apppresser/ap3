import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WooList } from './woo-list';

@NgModule({
  declarations: [
    WooList,
  ],
  imports: [
    IonicPageModule.forChild(WooList),
  ],
})
export class WooListModule {}
