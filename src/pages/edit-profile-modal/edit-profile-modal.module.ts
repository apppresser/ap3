import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { EditProfileModal } from './edit-profile-modal';

@NgModule({
  declarations: [
    EditProfileModal,
  ],
  imports: [
    IonicPageModule.forChild(EditProfileModal),
    TranslateModule.forChild()
  ],
})
export class EditProfileModalModule {}
