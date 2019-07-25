import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { MediaPlayer } from './media-player';
import { SanitizeHtmlModule } from "../../pipes/sanitize-html/sanitize-html.module";

import {VgCoreModule} from 'videogular2/core';
import {VgControlsModule} from 'videogular2/controls';
import {VgOverlayPlayModule} from 'videogular2/overlay-play';
import {VgBufferingModule} from 'videogular2/buffering';

import { PdfViewerModule } from 'ng2-pdf-viewer';

@NgModule({
  declarations: [
    MediaPlayer,
  ],
  imports: [
    IonicPageModule.forChild(MediaPlayer),
    TranslateModule.forChild(),
    SanitizeHtmlModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    PdfViewerModule
  ],
  exports: [
    MediaPlayer
  ]
})
export class MediaPlayerModule {}
