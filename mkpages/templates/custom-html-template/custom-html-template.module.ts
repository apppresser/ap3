import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { CustomHtmlTemplate } from './custom-html-template';
import { SafeUrlModule } from '../../pipes/safe-url/safe-url.module';
import { ApListComponentModule } from '../../components/ap-list/ap-list.module';
import { ApSliderComponentModule } from '../../components/ap-slider/ap-slider.module';

@NgModule({
  declarations: [
    CustomHtmlTemplate,
  ],
  imports: [
    IonicPageModule.forChild(CustomHtmlTemplate),
    TranslateModule.forChild(),
    SafeUrlModule,
    ApSliderComponentModule,
    ApListComponentModule 
  ],
  entryComponents: [
    CustomHtmlTemplate
  ],
  exports: [
    CustomHtmlTemplate
  ]
})
export class CustomHtmlTemplateModule {}