import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import {DynamicComponentModule} from 'angular2-dynamic-component/index';
import { CustomPage } from './custom-page';
import { ApListComponentModule } from '../../components/ap-list/ap-list.module';
import { ApSliderComponentModule } from '../../components/ap-slider/ap-slider.module';
import { WooListComponentModule } from '../../components/woo-list/woo-list.module';
import { WooSliderComponentModule } from '../../components/woo-slider/woo-slider.module';

@NgModule({
  declarations: [
    CustomPage,
  ],
  imports: [
    IonicPageModule.forChild(CustomPage),
    TranslateModule.forChild(),
    DynamicComponentModule,
    ApListComponentModule,
    ApSliderComponentModule,
    WooListComponentModule,
    WooSliderComponentModule
  ],
  entryComponents: [
    CustomPage
  ],
  exports: [
    CustomPage
  ]
})
export class CustomPageModule {}
