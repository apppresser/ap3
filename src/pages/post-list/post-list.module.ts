import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { PostList } from './post-list';

@NgModule({
  declarations: [
    PostList,
  ],
  imports: [
    IonicPageModule.forChild(PostList),
    TranslateModule.forChild()
  ],
  exports: [
    PostList
  ]
})
export class PostListModule {}
