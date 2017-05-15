import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSettings } from './language-settings';

@NgModule({
  declarations: [
    LanguageSettings,
  ],
  imports: [
    IonicPageModule.forChild(LanguageSettings),
    TranslateModule.forChild()
  ],
  exports: [
    LanguageSettings
  ]
})
export class LanguageSettingsModule {}
