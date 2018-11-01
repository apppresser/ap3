import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ThanksPage } from './thank-you';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ThanksPage,
  ],
  imports: [
    IonicPageModule.forChild(ThanksPage),
    TranslateModule.forChild()
  ],
})
export class ThanksPageModule {}
