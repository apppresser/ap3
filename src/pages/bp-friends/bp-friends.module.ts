import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { BpFriends } from './bp-friends';

@NgModule({
  declarations: [
    BpFriends,
  ],
  imports: [
    IonicPageModule.forChild(BpFriends),
    TranslateModule.forChild()
  ],
  exports: [
    BpFriends
  ]
})
export class BpFriendsModule {}