import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { DynamicComponentModule } from 'angular2-dynamic-component/index';
import { CustomPage } from './custom-page';
import { VideoPlaylistModule } from "../video-playlist/video-playlist.module";

@NgModule({
  declarations: [
    CustomPage,
  ],
  imports: [
    IonicPageModule.forChild(CustomPage),
    TranslateModule.forChild(),
    VideoPlaylistModule,
    DynamicComponentModule
  ],
  entryComponents: [
    CustomPage
  ],
  exports: [
    CustomPage
  ]
})
export class CustomPageModule {}
