import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PdfModal } from './pdf-modal';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@NgModule({
  declarations: [
    PdfModal,
  ],
  imports: [
    IonicPageModule.forChild(PdfModal),
    PdfViewerModule
  ],
})
export class PdfModalModule {}
