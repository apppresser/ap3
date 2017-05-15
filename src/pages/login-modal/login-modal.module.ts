import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { LoginModal } from './login-modal';

@NgModule({
  declarations: [
    LoginModal,
  ],
  imports: [
    IonicPageModule.forChild(LoginModal),
    TranslateModule.forChild()
  ],
  exports: [
    LoginModal
  ]
})
export class LoginModalModule {}
