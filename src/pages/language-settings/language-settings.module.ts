import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LanguageSettings } from './language-settings';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {Http} from '@angular/http';

@NgModule({
  declarations: [
    LanguageSettings,
  ],
  imports: [
    IonicPageModule.forChild(LanguageSettings),
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [Http]
      }
    })
  ],
  exports: [
    LanguageSettings
  ]
})
export class LanguageSettingsModule {}

// required for ng translate, tells it to look in assets folder for trans files
export function createTranslateLoader(http: Http) {
    return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}