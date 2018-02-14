import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { CustomHtmlTemplate } from './custom-html-template';
import { VideoPlaylistModule } from "../video-playlist/video-playlist.module";

@NgModule({
  declarations: [
    CustomHtmlTemplate,
  ],
  imports: [
    IonicPageModule.forChild(CustomHtmlTemplate),
    TranslateModule.forChild(),
    VideoPlaylistModule
  ],
  entryComponents: [
    CustomHtmlTemplate
  ],
  exports: [
    CustomHtmlTemplate
  ]
})
export class CustomHtmlTemplateModule {}
