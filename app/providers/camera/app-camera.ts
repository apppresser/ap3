import {Injectable} from '@angular/core';
import {Camera, Transfer, Device} from 'ionic-native';

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

  iframedoc: any;
  iframewin: any;
  appbuddy: boolean = false;

  constructor() { }

  takePicture(appbuddy) {

    if(appbuddy) {
      this.appbuddy = true;
    }

    // console.log('appbuddy app-camera.ts', this.appbuddy);

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

  uploadPhoto(imageURI) {

    let fileTransfer = new Transfer();

    this.iframedoc = (<any>document.getElementById('ap3-iframe')).contentWindow.document;
    this.iframewin = (<any>document.getElementById('ap3-iframe')).contentWindow.window;

    // console.log('imageURI', imageURI);

    let image = imageURI.substr(imageURI.lastIndexOf('/') + 1);

    let name = image.split("?")[0];
    let anumber = image.split("?")[1];
    let ajaxurl = this.iframewin.apppCore.ajaxurl;

    if ('Android' === Device.device.platform) {
      image = anumber + '.jpg';
    }

    // console.log(image);

    let options = new FileUploadOptions();
    options.fileKey = 'appp_cam_file';
    options.fileName = imageURI ? image : '';
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
    let form_elements = this.iframedoc.getElementById('appp_camera_form').elements;

    // console.log(form_elements);

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

        if (e.lengthComputable) {
          /*appTop.camera.statusProgress().innerHTML = '<progress id="progress" value="1" max="100"></progress>';*/
          this.iframedoc.getElementById('cam-progress').style.visibility = 'visible';
          let perc = Math.floor(e.loaded / e.total * 100);
          this.iframedoc.getElementById('progress').value = perc;
        }

      });

    } else {

      console.log('start regular upload');

      // Not appbuddy, do normal photo upload
      this.iframedoc.getElementById('appp_cam_post_title').value = '';
      options.params = params;

      fileTransfer.upload(imageURI, ajaxurl, options, true).then(this.uploadWin).catch( this.uploadErr );

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

    // console.log('Code = ' + r.responseCode);
    // console.log('Response = ' + r.response);
    // console.log('Sent = ' + r.bytesSent);

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

  uploadWin() {

    // not sure why, but can't access this.iframedoc
    let framedoc = (<any>document.getElementById('ap3-iframe')).contentWindow.document;
    let appcamera = (<any>document.getElementById('ap3-iframe')).contentWindow.window.appcamera;
    let msg = appcamera.msg.moderation;

    console.log('uploadWin', msg );

    if (!appcamera.moderation_on) {

      msg = appcamera.msg.success;
    }

    framedoc.getElementById('cam-status').innerHTML = '<p>' + msg + '</p>';
    framedoc.getElementById('cam-progress').style.visibility = 'hidden';
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
            console.log('attach img raw response', response, matches);
          }
          console.log('attach img', matches);
        }

        if (matches[0]) {
          return JSON.parse(matches[0]);
        }
      }

      return '';

  }

  
}