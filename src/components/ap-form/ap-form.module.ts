import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ApForm } from './ap-form';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ApForm,
  ],
  imports: [
    IonicPageModule.forChild(ApForm),
    TranslateModule.forChild()
  ],
  exports: [
    ApForm
  ]
})
export class ApFormModule {}
