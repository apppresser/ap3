import { NgModule } from '@angular/core';
import { SanitizeHtml } from './sanitize-html';

@NgModule({
  declarations: [SanitizeHtml],
  exports: [SanitizeHtml]
})
export class SanitizeHtmlModule { }