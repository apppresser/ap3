import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { CustomHtmlTemplate } from './custom-html-template';
import { SanitizeHtmlModule } from '../../pipes/sanitize-html/sanitize-html.module';

@NgModule({
  declarations: [
    CustomHtmlTemplate,
  ],
  imports: [
    IonicPageModule.forChild(CustomHtmlTemplate),
    TranslateModule.forChild(),
    SanitizeHtmlModule
  ],
  entryComponents: [
    CustomHtmlTemplate
  ],
  exports: [
    CustomHtmlTemplate
  ]
})
export class CustomHtmlTemplateModule {}
