import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WooList } from './woo-list';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    WooList,
  ],
  imports: [
    IonicPageModule.forChild(WooList),
    TranslateModule.forChild()
  ],
})
export class WooListModule {}
