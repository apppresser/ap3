import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import {DynamicComponentModule} from 'angular2-dynamic-component/index';
import { CustomPage } from './custom-page';
import { ListComponentModule } from '../../components/list/list.module';
import { SliderComponentModule } from '../../components/slider/slider.module';

@NgModule({
  declarations: [
    CustomPage,
  ],
  imports: [
    IonicPageModule.forChild(CustomPage),
    TranslateModule.forChild(),
    DynamicComponentModule,
    ListComponentModule,
    SliderComponentModule
  ],
  entryComponents: [
    CustomPage
  ],
  exports: [
    CustomPage
  ]
})
export class CustomPageModule {}
