import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ApSliderComponent } from './ap-slider';

@NgModule({
  declarations: [
    ApSliderComponent,
  ],
  imports: [
    IonicPageModule.forChild(ApSliderComponent),
    TranslateModule.forChild()
  ],
  exports: [
    ApSliderComponent
  ]
})
export class ApSliderComponentModule {}