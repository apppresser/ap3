import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AudioPlayerComponent } from './audio-player';

@NgModule({
  declarations: [
    AudioPlayerComponent,
  ],
  imports: [
    IonicPageModule.forChild(AudioPlayerComponent)
  ],
  exports: [
    AudioPlayerComponent
  ]
})
export class AudioPlayerComponentModule {}