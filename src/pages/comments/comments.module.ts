import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CommentsPage } from './comments';
import { TranslateModule } from '@ngx-translate/core';
import { StarRatingComponentModule } from '../../components/star-rating/star-rating.module';

@NgModule({
  declarations: [
    CommentsPage,
  ],
  imports: [
    IonicPageModule.forChild(CommentsPage),
    TranslateModule.forChild(),
    StarRatingComponentModule
  ],
})
export class CommentsPageModule {}
