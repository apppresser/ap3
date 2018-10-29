import { Component, Input } from '@angular/core';
import {IonicPage} from 'ionic-angular';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'star-rating',
  templateUrl: 'star-rating.html'
})
export class StarRatingComponent {

	@Input() rating: string;

	constructor(){
		console.log(this.rating)
	}

}