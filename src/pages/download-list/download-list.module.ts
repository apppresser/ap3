import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { DownloadList } from './download-list';

@NgModule({
  declarations: [
    DownloadList,
  ],
  imports: [
    IonicPageModule.forChild(DownloadList),
    TranslateModule.forChild()
  ],
  exports: [
    DownloadList
  ]
})
export class DownloadListModule {}
