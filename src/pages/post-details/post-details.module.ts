import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { PostDetailsPage } from './post-details';

@NgModule({
  declarations: [
    PostDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(PostDetailsPage),
    TranslateModule.forChild()
  ],
  exports: [
    PostDetailsPage
  ]
})
export class PostDetailsPageModule {}
