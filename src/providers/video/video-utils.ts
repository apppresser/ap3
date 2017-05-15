import { Injectable, ElementRef } from "@angular/core";
import {Platform} from 'ionic-angular';

@Injectable()
export class VideoUtils {

	constructor(private platform: Platform) {}

	// stop videos from playing when app is exited, required by Google
	killVideos(elementRef: ElementRef) {

		this.platform.pause.subscribe(() => {

		  let frames = elementRef.nativeElement.getElementsByTagName('iframe')

		  let Vidsrc

		  for (let i in frames) {

		    if( /youtube|wistia|vimeo/.test(frames[i].src) ) {
		       Vidsrc = frames[i].src;
		       frames[i].src = '';
		       setTimeout( function() {
		           frames[i].src = Vidsrc;
		       }, 500);
		    }

		  }
		  
		});

	}
}