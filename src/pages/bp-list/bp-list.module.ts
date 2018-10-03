import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { BpList } from './bp-list';
import { DoLinksModule } from '../../pipes/do-links/do-links.module';

@NgModule({
  declarations: [
    BpList,
  ],
  imports: [
    IonicPageModule.forChild(BpList),
    TranslateModule.forChild(),
    DoLinksModule
  ],
  exports: [
    BpList
  ]
})
export class BpListModule {}