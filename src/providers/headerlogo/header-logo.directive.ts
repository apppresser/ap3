import { Directive, OnInit, HostBinding, Injectable, ElementRef, Renderer, Input } from '@angular/core';

import { HeaderLogo } from './header-logo.service';
import 'rxjs/Rx';

@Directive({
	selector: '[appHeaderLogo]'
})
@Injectable()
export class HeaderLogoDirective implements OnInit {

	@Input() appHeaderLogo;

	// adds or remove the .app-header-logo class
	@HostBinding('class.app-header-logo') image: boolean = false;

	constructor(private headerLogo: HeaderLogo, private elem: ElementRef, private renderer: Renderer) {}

	ngOnInit() {

		// appHeaderLogo will containg the value of is_home
		if(this.appHeaderLogo) {
			this.renderer.setElementStyle(this.elem.nativeElement, 'backgroundImage', 'url('+this.headerLogo.image_url+')');

			// since the loading of the image is asynchronous we need to subscribe to it
			this.headerLogo.hasImage.subscribe( (hasImage) => {
				this.image = hasImage;
			});		
		}
	}
}