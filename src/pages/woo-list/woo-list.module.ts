import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WooList } from './woo-list';
import { TranslateModule } from '@ngx-translate/core';
import { StarRatingComponentModule } from '../../components/star-rating/star-rating.module';

@NgModule({
  declarations: [
    WooList,
  ],
  imports: [
    IonicPageModule.forChild(WooList),
    TranslateModule.forChild(),
    StarRatingComponentModule
  ],
})
export class WooListModule {}
