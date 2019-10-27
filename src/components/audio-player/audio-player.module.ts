import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { AudioPlayerComponent } from './audio-player';

@NgModule({
  declarations: [
    AudioPlayerComponent,
  ],
  imports: [
    IonicPageModule.forChild(AudioPlayerComponent),
    TranslateModule.forChild()
  ],
  exports: [
    AudioPlayerComponent
  ]
})
export class AudioPlayerComponentModule {}