import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { SliderComponent } from './slider';

@NgModule({
  declarations: [
    SliderComponent,
  ],
  imports: [
    IonicPageModule.forChild(SliderComponent),
    TranslateModule.forChild()
  ],
  exports: [
    SliderComponent
  ]
})
export class SliderComponentModule {}