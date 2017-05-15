import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { PushSettings } from './push-settings';

@NgModule({
  declarations: [
    PushSettings,
  ],
  imports: [
    IonicPageModule.forChild(PushSettings),
    TranslateModule.forChild()
  ],
  exports: [
    PushSettings
  ]
})
export class PushSettingsModule {}
