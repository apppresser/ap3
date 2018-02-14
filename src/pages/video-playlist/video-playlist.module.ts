import { NgModule } from '@angular/core';
import { VideoPlaylistComponent } from './video-playlist.component';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';

import {VgCoreModule} from 'videogular2/core';
import {VgControlsModule} from 'videogular2/controls';
import {VgOverlayPlayModule} from 'videogular2/overlay-play';
import {VgBufferingModule} from 'videogular2/buffering';

@NgModule({
  declarations: [
    VideoPlaylistComponent,
  ],
  imports: [
    IonicPageModule.forChild(VideoPlaylistComponent),
    TranslateModule.forChild(),
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
  ],
  entryComponents: [
    VideoPlaylistComponent
  ],
  exports: [
    VideoPlaylistComponent
  ]
})
export class VideoPlaylistModule {}
