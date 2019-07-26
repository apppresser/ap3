import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { WooListComponent } from './woo-list-component';
import { StarRatingComponentModule } from '../../components/star-rating/star-rating.module';

@NgModule({
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  declarations: [
    WooListComponent,
  ],
  imports: [
    IonicPageModule.forChild(WooListComponent),
    TranslateModule.forChild(),
    StarRatingComponentModule
  ],
  exports: [
    WooListComponent
  ]
})
export class WooListComponentModule {}