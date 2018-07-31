import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { BpList } from './bp-list';

@NgModule({
  declarations: [
    BpList,
  ],
  imports: [
    IonicPageModule.forChild(BpList),
    TranslateModule.forChild()
  ],
  exports: [
    BpList
  ]
})
export class BpListModule {}