import { Directive, OnInit, HostBinding, Injectable, ElementRef, Renderer } from '@angular/core';

import { HeaderLogo } from './header-logo.service';
import 'rxjs/Rx';

@Directive({
	selector: '[appHeaderLogo]'
})
@Injectable()
export class HeaderLogoDirective implements OnInit {

	// adds or remove the .app-header-logo class
	@HostBinding('class.app-header-logo') image: boolean = true;

	constructor(private headerLogo: HeaderLogo, private elem: ElementRef, private renderer: Renderer) {}

	ngOnInit() {

		this.renderer.setElementStyle(this.elem.nativeElement, 'backgroundImage', 'url('+this.headerLogo.image_url+')');

		// since the loading of the image is asynchronous we need to subscribe to it
		this.headerLogo.hasImage.subscribe( (hasImage) => {
			this.image = hasImage;
		});
	}
}