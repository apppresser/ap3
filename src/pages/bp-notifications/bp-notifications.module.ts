import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { BpNotifications } from './bp-notifications';

@NgModule({
  declarations: [
    BpNotifications,
  ],
  imports: [
    IonicPageModule.forChild(BpNotifications),
    TranslateModule.forChild()
  ],
  exports: [
    BpNotifications
  ]
})
export class BpNotificationsModule {}