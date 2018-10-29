import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { StarRatingComponent } from './star-rating';

@NgModule({
  declarations: [
    StarRatingComponent,
  ],
  imports: [
    IonicPageModule.forChild(StarRatingComponent),
    TranslateModule.forChild()
  ],
  exports: [
    StarRatingComponent
  ]
})
export class StarRatingComponentModule {}