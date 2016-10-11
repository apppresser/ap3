import {Component, TemplateRef, ContentChild} from '@angular/core';
import {NavParams} from 'ionic-angular';

@Component({
  templateUrl: 'custom-page.html'
})
export class CustomPage {

  template:any;

  constructor() {
  	// this.template = '<template #template>from comp</template>';
  }

}