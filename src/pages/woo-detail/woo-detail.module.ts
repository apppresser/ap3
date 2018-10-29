import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WooDetail } from './woo-detail';
import { TranslateModule } from '@ngx-translate/core';
import { IonicImageViewerModule } from 'ionic-img-viewer';
import { WooSliderComponentModule } from '../../components/woo-slider/woo-slider.module';
import { StarRatingComponentModule } from '../../components/star-rating/star-rating.module';

@NgModule({
  declarations: [
    WooDetail,
  ],
  imports: [
    IonicPageModule.forChild(WooDetail),
    TranslateModule.forChild(),
    IonicImageViewerModule,
    WooSliderComponentModule,
    StarRatingComponentModule
  ],
})
export class WooDetailModule {}
