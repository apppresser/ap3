import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { CustomHtmlTemplate } from './custom-html-template';
import { SafeUrlModule } from '../../pipes/safe-url/safe-url.module';

@NgModule({
  declarations: [
    CustomHtmlTemplate,
  ],
  imports: [
    IonicPageModule.forChild(CustomHtmlTemplate),
    TranslateModule.forChild(),
    SafeUrlModule
  ],
  entryComponents: [
    CustomHtmlTemplate
  ],
  exports: [
    CustomHtmlTemplate
  ]
})
export class CustomHtmlTemplateModule {}
