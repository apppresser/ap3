import {NavParams} from 'ionic-angular';
import {Component} from '@angular/core';
import {Geolocation} from 'ionic-native';
// import customIframe from '../../components/iframe/index';


@Component({
    templateUrl: 'build/pages/iframe/index.html'
})
export default class {
    title: string;
    url: string;
    iframe: any;
    param: string;
    constructor(private navParams: NavParams) {
        this.title = navParams.data.title;

        if ( navParams.data.url.indexOf('?') >= 0 ) {
            this.param = '&appp=2';
        } else {
            this.param = '?appp=2';
        }

        this.url = navParams.data.url + this.param;
        
        console.log('navParams.data', navParams.data);
    }
    iframeLoaded(e) {
        console.log('iframeLoaded', e)
    }
    activityModal() {
        this.iframe = document.getElementById('ap3-iframe').contentWindow;
        this.iframe.postMessage('activity', '*');
    }
    checkinModal() {

        this.iframe = document.getElementById('ap3-iframe').contentWindow;

        // first message is to show modal, then we send through location
        this.iframe.postMessage('checkin', '*');

        // Do this when checkin button clicked
        Geolocation.getCurrentPosition().then((position) => {

            let latitude = position.coords.latitude;
            let longitude = position.coords.longitude;

            console.log('position', position);
            // need to postmessage this
            this.iframe.postMessage({ lat: latitude, long: longitude }, '*');

        })
    }
}
