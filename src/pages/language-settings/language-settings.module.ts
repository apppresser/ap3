import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LanguageSettings } from './language-settings';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule, HttpClient} from '@angular/common/http';

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
        deps: [HttpClient]
      }
    })
  ],
  exports: [
    LanguageSettings
  ]
})
export class LanguageSettingsModule {}

// required for ng translate, tells it to look in assets folder for trans files
export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}