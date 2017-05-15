import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { MediaPlayer } from './media-player';

@NgModule({
  declarations: [
    MediaPlayer,
  ],
  imports: [
    IonicPageModule.forChild(MediaPlayer),
    TranslateModule.forChild()
  ],
  exports: [
    MediaPlayer
  ]
})
export class MediaPlayerModule {}
