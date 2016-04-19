import {Component, Input} from 'angular2/core';

@Component({
    selector: "custom-iframe",
    styles: [require('!raw!autoprefixer!sass!./index.scss')],
    template: `<iframe #iframe [src]="iframeSrc"></iframe>`
})
export default class customIframe {
    @Input('src') iframeSrc: string;
    constructor() {
        
        console.log('this.iframeSrc', this.iframeSrc)
    }

    ngOnInit() {
        console.log('[Component] iframe ngOnInit');
    }
}