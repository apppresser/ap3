import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { Iframe } from './iframe';

@NgModule({
  declarations: [
    Iframe,
  ],
  imports: [
    IonicPageModule.forChild(Iframe),
    TranslateModule.forChild()
  ],
  exports: [
    Iframe
  ]
})
export class IframeModule {}
