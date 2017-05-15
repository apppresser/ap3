import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { PostDetailsPage } from './post-details';
import { SanitizeHtmlModule } from '../../pipes/sanitize-html/sanitize-html.module';

@NgModule({
  declarations: [
    PostDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(PostDetailsPage),
    TranslateModule.forChild(),
    SanitizeHtmlModule
  ],
  exports: [
    PostDetailsPage
  ]
})
export class PostDetailsPageModule {}
