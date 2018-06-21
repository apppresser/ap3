import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ApListComponent } from './ap-list';

@NgModule({
  declarations: [
    ApListComponent,
  ],
  imports: [
    IonicPageModule.forChild(ApListComponent),
    TranslateModule.forChild()
  ],
  exports: [
    ApListComponent
  ]
})
export class ApListComponentModule {}