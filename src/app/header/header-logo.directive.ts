import { Directive, OnInit, ElementRef, Renderer } from '@angular/core';

@Directive({
	selector: '[appHeaderLogo]'
})
export class HeaderLogoDirective implements OnInit {
	constructor(private element: ElementRef, private renderer: Renderer) {}

	ngOnInit() {

		const header = this.element.nativeElement;
		const app_header_logo = window.localStorage.getItem('app-header-logo-local');

		if( app_header_logo ) {
			this.renderer.setElementClass(header, 'app-header-logo', true);
		}

	}
}