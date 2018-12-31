import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ApIapForm } from './ap-iap-form';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ApIapForm,
  ],
  imports: [
    IonicPageModule.forChild(ApIapForm),
    TranslateModule.forChild()
  ],
  exports: [
    ApIapForm
  ]
})
export class ApIapFormModule {}
