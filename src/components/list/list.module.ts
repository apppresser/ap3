import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ListComponent } from './list';

@NgModule({
  declarations: [
    ListComponent,
  ],
  imports: [
    IonicPageModule.forChild(ListComponent),
    TranslateModule.forChild()
  ],
  exports: [
    ListComponent
  ]
})
export class ListComponentModule {}