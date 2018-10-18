import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { WooListComponent } from './woo-list';

@NgModule({
  declarations: [
    WooListComponent,
  ],
  imports: [
    IonicPageModule.forChild(WooListComponent),
    TranslateModule.forChild()
  ],
  exports: [
    WooListComponent
  ]
})
export class WooListComponentModule {}