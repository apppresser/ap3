import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { WooListComponent } from './woo-list-component';
import { StarRatingComponentModule } from '../../components/star-rating/star-rating.module';

@NgModule({
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