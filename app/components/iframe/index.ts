import {Component, Input, Output } from 'ionic-angular';

@Component({
    selector: "custom-iframe",
    templateUrl: "build/components/iframe/index.html"
})
export default class customIframe {
    @Input('src') iframeSrc: string;
    loaded: boolean;
    constructor() {
        this.loaded = false;
    }

    onLoad(e) {
        console.log('[custom-iframe] onLoad', e);
        this.loaded = true;
    }

    ngOnInit() {
        console.log('[custom-iframe] ngOnInit');
    }
}