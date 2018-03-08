import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { MediaList } from './post-list';

@NgModule({
  declarations: [
    MediaList,
  ],
  imports: [
    IonicPageModule.forChild(MediaList),
    TranslateModule.forChild()
  ],
  exports: [
    MediaList
  ]
})
export class MediaListModule {}
