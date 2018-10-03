import { Pipe, PipeTransform } from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import anchorme from "anchorme";
/*
 * This converts text links to HTML links with target blank
 * It also bypasses security to display videos
 * http://alexcorvi.github.io/anchorme.js/
 */
@Pipe({ name: 'doLinks' })
export class DoLinks implements PipeTransform {
  constructor( private sanitizer: DomSanitizer ) {}
  transform( str ) {

  	str = anchorme(str, { attributes: [{
		name:"target",
		value:"_blank"
	}] } );

    return this.sanitizer.bypassSecurityTrustHtml( str );
  }
}