import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WooAccountComponent } from './woo-account';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    WooAccountComponent,
  ],
  imports: [
    IonicPageModule.forChild(WooAccountComponent),
    TranslateModule.forChild()
  ],
  exports: [
    WooAccountComponent
  ]
})
export class WooAccountComponentModule {}
