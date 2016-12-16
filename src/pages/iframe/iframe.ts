import {NavParams, Nav, LoadingController, ModalController} from 'ionic-angular';
import {Component} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Geolocation, Device} from 'ionic-native';

import {MediaPlayer} from '../media-player/media-player';

@Component({
    templateUrl: 'iframe.html'
})
export class Iframe {

    title: string;
    url: any;
    iframe: any;
    param: string;
    loaded: boolean = false;
    activityModal: boolean = false;
    checkinModal: boolean = false;

    constructor(
        public navParams: NavParams, 
        public loadingController: LoadingController, 
        public sanitizer: DomSanitizer,
        public modalCtrl: ModalController
        ) {
        this.title = navParams.data.title;

        if ( navParams.data.url.indexOf('?') >= 0 ) {
            this.param = '&appp=3';
        } else {
            this.param = '?appp=3';
        }

        this.url = this.sanitizer.bypassSecurityTrustResourceUrl( navParams.data.url + this.param );

        let dataurl = navParams.data.url;

        // Show error message if in preview and not using https
        this.previewAlert( navParams.data.url );
        
        console.log('navParams.data', navParams.data);

    }

    ionViewWillEnter() {
        this.iframeLoading();
    }

    iframeLoading() {

        // set this.loaded so cached pages don't show loading spinner
        if( this.loaded )
            return;

        let loading = this.loadingController.create({
            showBackdrop: false,
            dismissOnPageChange: false
        });

        loading.present(loading);

        // When WP site loads, attach our click events
        window.addEventListener('message', (e) => {

            // get current window so we can find active iframe
            let w = e.target;

            if( e.data === 'site_loaded' ) {
                loading.dismiss();
            } else if( e.data === 'reload_frame' ) {

                // need to reload frame on login
                this.iframe = (<any>w).document.getElementsByClassName('ap3-iframe')[0];
                let src = this.iframe.src;
                this.iframe.src = src;

            } else if( e.data === 'activity_modal' ) {
                this.activityModal = true;
            } else if( e.data === 'checkin_modal' ) {
                this.checkinModal = true;
            } else if( e.data.indexOf('{') === 0 ) {

                // if it's a json object, parse it
                var parsed = JSON.parse( e.data );

                if( parsed.media ) {
                    this.mediaModal( parsed.media, parsed.img );
                }

            }
            
        });

        setTimeout(() => {
            loading.dismiss();
        }, 8000);

        this.loaded = true;
    }

    // find the first ancestor with the given class name
    findAncestor(el, cls) {
        while ((el = el.parentElement) && !el.classList.contains(cls));
        return el;
    }

    findIframe( el ) {

        /* 
         Ionic stacks cached views on top of each other, which causes duplicate ids on the page. We need to find the active page in the stack, and send our post messages there. Otherwise message is sent to the wrong page.
        */

        let page = this.findAncestor( el, 'ion-page' );

        this.iframe = page.getElementsByClassName('ap3-iframe')[0];

    }

    doActivityModal( event ) {

        this.findIframe( event.target );

        this.iframe.contentWindow.postMessage('activity', '*');

    }

    doCheckinModal( event ) {

        this.findIframe( event.target );

        // first message is to show modal, then we send through location
        this.iframe.contentWindow.postMessage('checkin', '*');

        // Do this when checkin button clicked
        Geolocation.getCurrentPosition().then((position) => {

            let latitude = position.coords.latitude;
            let longitude = position.coords.longitude;

            console.log('position', position);
            // need to postmessage this
            this.iframe.contentWindow.postMessage({ lat: latitude, long: longitude }, '*');

        });

    }

    mediaModal( src, img = null ) {

        let modal = this.modalCtrl.create(MediaPlayer, {source: src, image: img});
        modal.present();

    }

    // Show alert in preview if not using https
    previewAlert(url) {

        if( Device.device.platform != 'iOS' && Device.device.platform != 'Android' && url.indexOf('http://') >= 0 ) {

          alert('Cannot display http pages in browser preview. Please build app for device or use https.');

        }

    }
}
