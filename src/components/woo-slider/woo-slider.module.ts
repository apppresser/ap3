import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { WooSliderComponent } from './woo-slider';

@NgModule({
  declarations: [
    WooSliderComponent,
  ],
  imports: [
    IonicPageModule.forChild(WooSliderComponent),
    TranslateModule.forChild()
  ],
  exports: [
    WooSliderComponent
  ]
})
export class WooSliderComponentModule {}