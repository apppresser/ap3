import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WooCartComponent } from './woo-cart';
import { TranslateModule } from '@ngx-translate/core';
import { WooSliderComponentModule } from '../../components/woo-slider/woo-slider.module';
import { StarRatingComponentModule } from '../../components/star-rating/star-rating.module';

@NgModule({
  declarations: [
    WooCartComponent,
  ],
  imports: [
    IonicPageModule.forChild(WooCartComponent),
    TranslateModule.forChild(),
    WooSliderComponentModule,
    StarRatingComponentModule
  ],
  exports: [
    WooCartComponent
  ]
})
export class WooCartComponentModule {}
