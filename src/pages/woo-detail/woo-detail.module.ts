import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WooDetail } from './woo-detail';
import { TranslateModule } from '@ngx-translate/core';
import { IonicImageViewerModule } from 'ionic-img-viewer';

@NgModule({
  declarations: [
    WooDetail,
  ],
  imports: [
    IonicPageModule.forChild(WooDetail),
    TranslateModule.forChild(),
    IonicImageViewerModule
  ],
})
export class WooDetailModule {}
