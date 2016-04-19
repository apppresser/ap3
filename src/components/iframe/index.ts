import {Component, Input, Output, EventEmitter } from 'angular2/core';

@Component({
    selector: "custom-iframe",
    styles: [require('!raw!autoprefixer!sass!./index.scss')],
    template: require('./index.html')
})
export default class customIframe {
    @Input('src') iframeSrc: string;
    @Output() load: EventEmitter<any> = new EventEmitter();
    loaded: boolean;
    constructor() {
        this.loaded = false;
    }

    onLoad(e) {
        console.log('[custom-iframe] onLoad', e);
        this.loaded = true;
        this.load.emit(e);
    }

    ngOnInit() {
        console.log('[custom-iframe] ngOnInit');
    }
}