import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WooList } from './woo-list';
import { TranslateModule } from '@ngx-translate/core';
import { StarRatingComponentModule } from '../../components/star-rating/star-rating.module';

@NgModule({
	schemas: [
	 CUSTOM_ELEMENTS_SCHEMA
	],
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
