import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { PostList } from './post-list';
import { SanitizeHtmlModule } from '../../pipes/sanitize-html/sanitize-html.module';

@NgModule({
  declarations: [
    PostList,
  ],
  imports: [
    IonicPageModule.forChild(PostList),
    TranslateModule.forChild(),
    SanitizeHtmlModule
  ],
  exports: [
    PostList
  ]
})
export class PostListModule {}
