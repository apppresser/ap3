import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { LdCoursePage } from './ld-course';
import { SanitizeHtmlModule } from '../../pipes/sanitize-html/sanitize-html.module';

@NgModule({
  declarations: [
    LdCoursePage,
  ],
  imports: [
    IonicPageModule.forChild(LdCoursePage),
    TranslateModule.forChild(),
    SanitizeHtmlModule
  ],
  exports: [
    LdCoursePage
  ]
})
export class LdCoursePageModule {}
