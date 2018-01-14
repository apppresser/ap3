import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { FooterNavComponent } from './footer-nav.component';

@NgModule({
  declarations: [
    FooterNavComponent,
  ],
  imports: [
    IonicPageModule.forChild(FooterNavComponent),
    TranslateModule.forChild(),
  ],
  exports: [
    FooterNavComponent
  ]
})
export class VideoPlaylistModule {}
