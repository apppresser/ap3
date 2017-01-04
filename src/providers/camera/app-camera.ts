import {Injectable} from '@angular/core';
import {Camera, Transfer, Device, ActionSheet} from 'ionic-native';

declare var FileUploadOptions:any;

/*
  Generated class for the Menus provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class AppCamera {

  options: any = {
    quality: 30,
    destinationType: Camera.DestinationType.FILE_URI,
    correctOrientation: true,
    targetWidth: 1204,
    targetHeight: 1204
  };

  iframe: any;
  iframedoc: any;
  iframewin: any;
  appbuddy: boolean = false;

  constructor() { }

  openSheet( appbuddy ) {

    let buttonLabels = ['Take Photo', 'Photo Library'];
    ActionSheet.show({
      'title': 'Choose an image',
      'buttonLabels': buttonLabels,
      'addCancelButtonWithLabel': 'Cancel'
    }).then((buttonIndex: number) => {
      if( buttonIndex === 1 ) {
        this.takePicture(appbuddy);
      } else if( buttonIndex === 2 ) {
        this.photoLibrary(appbuddy);
      }
    });

  }

  takePicture(appbuddy) {

    if(appbuddy) {
      this.appbuddy = true;
    }

    this.options.sourceType = Camera.PictureSourceType.CAMERA;

    this.doCamera();

  }

  photoLibrary(appbuddy) {

    if (appbuddy) {
      this.appbuddy = true;
    }

    // console.log('appbuddy app-camera.ts', this.appbuddy);

    this.options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;

    this.doCamera();

  }

  doCamera() {

    Camera.getPicture(this.options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64:
      // let base64Image = "data:image/jpeg;base64," + imageData;
      this.uploadPhoto(imageData);
    }, (err) => {
      alert(err);
    });

  }

  findIframe() {

      /* 
       Ionic stacks cached views on top of each other, which causes duplicate ids on the page. We need to find the active page in the stack, and send our post messages there. Otherwise message is sent to the wrong page.
      */

      // only look in active stack
      let components = document.querySelectorAll('#nav > ng-component');

      for (let i = components.length - 1; i >= 0; i--) {

        if( !components[i].hasAttribute('hidden') ) {
          // this is the shown ng-component element
          var active = components[i];
        }
      }

      // If we have tabs views stack differently
      if( active.querySelectorAll('ion-tabs .show-tabbar').length ) {

          // tabs exist, define iframe relative to active tab
          let page = active.querySelectorAll( 'ion-tab[aria-hidden=false] .show-page' );
          this.iframe = page[0].getElementsByClassName('ap3-iframe')[0];

          return;

      }

      // if no tabs
      this.iframe = active.querySelector('#ap3-iframe');

  }

  uploadPhoto(imageURI) {

    const fileTransfer = new Transfer();

    this.findIframe();

    this.iframedoc = this.iframe.contentWindow.document;
    this.iframewin = this.iframe.contentWindow.window;

    let image = imageURI.substr(imageURI.lastIndexOf('/') + 1);

    let name = image.split("?")[0];
    let anumber = image.split("?")[1];
    let ajaxurl = this.iframewin.apppCore.ajaxurl;

    if ('Android' === Device.platform) {
      image = anumber + '.jpg';
    }

    // this creates a random string based on the date
    let d = new Date().toTimeString();
    let random = d.replace(/[\W_]+/g, "").substr(0,6);

    let options = new FileUploadOptions();
    options.fileKey = 'appp_cam_file';
    // prepend image name with random string to avoid duplicate upload errors
    options.fileName = imageURI ? random + image : random;
    options.mimeType = 'image/jpeg';

    let params = {
      form_fields: null,
      form_values: null,
      appp_action: null,
      action: <string> null,
      nonce: null,
    };

    let form_fields = [];
    let form_values = [];
    let iterator;
    let form = this.iframedoc.getElementById('appp_camera_form');
    let form_elements = form.elements;

    // console.log('elements', form_elements);

    for (iterator = 0; iterator < form_elements.length; iterator++) {
      form_fields[iterator] = form_elements[iterator].name;
      form_values[iterator] = form_elements[iterator].value;
      // console.log(form_elements[iterator].name, form_elements[iterator].value);
    }

    params.form_fields = JSON.stringify(form_fields);
    params.form_values = JSON.stringify(form_values);
    params.appp_action = 'attach';

    // Maybe do appbuddy attach stuff. Difference is the action, nonce, and transfer success function.

    if ( this.appbuddy === true ) {

      // console.log('appbuddy upload');

      // see appcamera/inc/AppPresser_Camera_Ajax.php
      params.action = 'upload_image';

      if (this.iframedoc.getElementById('apppcamera-upload-image')) { // from appcamera shortcode
        params.nonce = this.iframedoc.getElementById('apppcamera-upload-image').value;
      } else if (this.iframedoc.getElementById('attach-photo')) { // from buddypress activity upload
        params.nonce = this.iframedoc.getElementById('attach-photo').getAttribute('data-nonce');
      }

      options.params = params;

      fileTransfer.upload(imageURI, ajaxurl, options, true).then((msg) => {
        this.attachWin(msg);
      }).catch((e) => {
        console.warn(e);
        this.appbuddy = false;
      });

      fileTransfer.onProgress( (e) => {

        let progress = this.iframedoc.getElementById('cam-progress');

        if (e.lengthComputable) {
          progress.style.visibility = 'visible';
          let perc = Math.floor(e.loaded / e.total * 100);
          progress.value = perc;
        }

      });

    } else {

      // Not appbuddy, do normal photo upload
      this.iframedoc.getElementById('appp_cam_post_title').value = '';
      options.params = params;

      fileTransfer.upload(imageURI, encodeURI(ajaxurl), options, true).then( r => {

        this.uploadWin(r);

      }).catch( e => {

        this.uploadErr(e);

      });

      fileTransfer.onProgress((e) => {

        if (e.lengthComputable) {
          /*appTop.camera.statusProgress().innerHTML = '<progress id="progress" value="1" max="100"></progress>';*/
          this.iframedoc.getElementById('cam-progress').style.visibility = 'visible';
          let perc = Math.floor(e.loaded / e.total * 100);
          this.iframedoc.getElementById('progress').value = perc;
        }

      });

    }

  }
 
  // handles displaying image in appbuddy activity modal after uploaded
  attachWin(r) {

    // console.log('attach win', r);

    this.findIframe();

    this.iframedoc = this.iframe.contentWindow.document;

    let action = this.iframedoc.getElementById('appp_action').value;

    let imgUrl = this.camUtil(r.response);

    let imgTag = (imgUrl) ? '<img src="' + imgUrl + '">' : '';

    this.iframedoc.getElementById('attach-image').value = imgUrl;
    this.iframedoc.getElementById('image-status').innerHTML = imgTag;
    this.iframedoc.getElementById('cam-progress').style.visibility = 'hidden';
    this.iframedoc.getElementById('cam-status').innerHTML = '';

    // hide action sheet
    this.iframedoc.getElementById('attach-image-sheet').className =
    this.iframedoc.getElementById('attach-image-sheet').className.replace(/\bactive\b/, 'hide');

    this.appbuddy = false;

  }

  uploadWin(r) {

    // console.log('upload win', r);

    this.findIframe();

    this.iframedoc = this.iframe.contentWindow.document;

    let appcamera = this.iframe.contentWindow.window.appcamera;
    let msg = appcamera.msg.moderation;
    let status = this.iframedoc.getElementById('cam-status');

    if (!appcamera.moderation_on) {

      msg = appcamera.msg.success;
    }

    status.innerHTML = '<p>' + msg + '</p>';
    this.iframedoc.getElementById('cam-progress').style.visibility = 'hidden';

    // clear message after 5 sec
    setTimeout( () => {
      status.innerHTML = '';
    }, 5000 );

  }

  uploadErr(e) {
    console.warn(e);
  }

  // parse and fetch the image url we need
  camUtil(response) {

      let debug = false;

      if (response && response.indexOf("http") > 0) {

        let regex = new RegExp("(\"http(.*)\/upload(.*)\.(jpg|png)\")", "gm");
        let matches = response.match(regex);

        if (debug && matches && matches.length) {
          if (response != matches[0]) {
            // console.log('attach img raw response', response, matches);
          }
          // console.log('attach img', matches);
        }

        if (matches[0]) {
          return JSON.parse(matches[0]);
        }
      }

      return '';

  }
  
}