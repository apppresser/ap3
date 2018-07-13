import {Injectable} from '@angular/core';
import {Camera} from '@ionic-native/camera';
import { Transfer, FileUploadOptions, TransferObject, FileUploadResult } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { Device } from "@ionic-native/device";
import { ActionSheet, ActionSheetOptions } from '@ionic-native/action-sheet';

declare var window;

/*
  Generated class for the Menus provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class AppCamera {

  options: any = {
    quality: 50,
    destinationType: this.Camera.DestinationType.FILE_URI,
    correctOrientation: true,
    targetWidth: 1204,
    targetHeight: 1204
  };

  iframe: any;
  iframedoc: any;
  iframewin: any;
  appbuddy: boolean = false;
  progress_timeout: any;

  constructor(private actionSheet: ActionSheet, private Camera: Camera, private Device: Device, private Transfer: Transfer, private File: File) { }

  openSheet( appbuddy ) {

    let buttonLabels = ['Take Photo', 'Photo Library'];
    
    this.actionSheet.show({
      title: 'Choose an image',
      buttonLabels: buttonLabels,
      addCancelButtonWithLabel: 'Cancel',
      destructiveButtonLast: true
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

    this.options.sourceType = this.Camera.PictureSourceType.CAMERA;

    this.doCamera();

  }

  photoLibrary(appbuddy) {

    if (appbuddy) {
      this.appbuddy = true;
    }

    // console.log('appbuddy app-camera.ts', this.appbuddy);

    this.options.sourceType = this.Camera.PictureSourceType.PHOTOLIBRARY;

    this.doCamera();

  }

  doCamera() {

    // sneak in the progress bar while taking/choosing photo for better UX
    this.progress_timeout = setTimeout( () => {
      this.uploadProgress(5,100);
    }, 1000 );

    this.Camera.getPicture(this.options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64:
      // let base64Image = "data:image/jpeg;base64," + imageData;
      this.uploadPhoto(imageData);
    }, (err) => {

      this.hideProgress();
      alert(err);
      
    });

  }

  findIframe() {

      /* 
       Ionic stacks cached views on top of each other, which causes duplicate ids on the page. We need to find the active page in the stack, and send our post messages there. Otherwise message is sent to the wrong page.
      */

      let components = document.querySelectorAll('#nav wordpress-page');

      for (var i = 0; i < components.length; ++i) {

          if( !components[i].hasAttribute('hidden') ) {
            // we are just getting the last component on the page
            var active = components[i];
          }
      }

      this.iframe = active.querySelector('#ap3-iframe');
      this.iframedoc = this.iframe.contentWindow.document;

  }

  uploadPhoto(camImage) {

    console.log('app-camera.ts AppCamera.uploadPhoto camImage', camImage);

    let imageURI = '';

    console.log('typeof camImage', typeof camImage, camImage);

    if(camImage.indexOf('{') === 0) { // from cordova-plugin-camera-with-exif
      let img = JSON.parse(camImage);
      imageURI = img.filename;
    } else { // from cordova-plugin-camera
      imageURI = camImage;
    }

    const fileTransfer: TransferObject = this.Transfer.create();

    this.findIframe();

    this.iframedoc = this.iframe.contentWindow.document;
    this.iframewin = this.iframe.contentWindow.window;

    let image = imageURI.substr(imageURI.lastIndexOf('/') + 1);

    let name = image.split("?")[0];
    let anumber = image.split("?")[1];
    let ajaxurl = this.iframewin.apppCore.ajaxurl;

    if ('Android' === this.Device.platform) {
      image = anumber + '.jpg';
    }

    // this creates a random string based on the date
    let d = new Date().toTimeString();
    let random = d.replace(/[\W_]+/g, "").substr(0,6);

    let options: FileUploadOptions = {
      fileKey: 'appp_cam_file',
      // prepend image name with random string to avoid duplicate upload errors
      fileName: imageURI ? random + image : random,
      mimeType: 'image/jpeg',
      httpMethod: "POST",
      chunkedMode: false
    };

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
    let shortcode_actions = ['new','this','library'];

    params.appp_action = 'attach'; // default: attach to BP activity

    // console.log('elements', form_elements);

    for (iterator = 0; iterator < form_elements.length; iterator++) {
      form_fields[iterator] = form_elements[iterator].name;
      form_values[iterator] = form_elements[iterator].value;
      // console.log(form_elements[iterator].name, form_elements[iterator].value);

      // set the action from the shortcode param
      if( form_elements[iterator].name == 'appp_action' && shortcode_actions.indexOf( form_elements[iterator].value ) > -1 ) {
        params.appp_action = form_elements[iterator].value;
        params.action = form_elements[iterator].value;
      }
      
    }

    params.form_fields = JSON.stringify(form_fields);
    params.form_values = JSON.stringify(form_values);

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
      }).catch((FileTransferError) => {
        this.appbuddy = false
        this.uploadErr(FileTransferError);
      });

    } else {

      // Not appbuddy, do normal photo upload
      this.iframedoc.getElementById('appp_cam_post_title').value = '';
      options.params = params;

      // console.log('uploadPhoto options', options);
      // console.log('fileTransfer.upload(imageURI, encodeURI(ajaxurl), options)', imageURI, encodeURI(ajaxurl), options);
      // console.log('ajaxurl', ajaxurl);

      fileTransfer.upload(imageURI, encodeURI(ajaxurl), options, true).then( r => {

        this.uploadWin(r);

      }).catch( FileTransferError => {

        this.uploadErr(FileTransferError);

      });

    }

    fileTransfer.onProgress((e) => {

      if (e.lengthComputable) {
        this.uploadProgress(e.loaded, e.total);
      }

    });
  }

  uploadProgress(loaded, total) {

    if( typeof( this.iframedoc ) === "undefined" ) {
      this.findIframe();
    }

    let progress = this.iframedoc.getElementById('cam-progress');
    progress.style.visibility = 'visible';
    let perc = Math.floor(loaded / total * 100);
    progress.value = perc;
  }

  hideProgress() {
    clearTimeout(this.progress_timeout);

    if( typeof( this.iframedoc ) === "undefined" ) {
      this.findIframe();
    }

    let progress = this.iframedoc.getElementById('cam-progress');
    progress.style.visibility = 'hidden';
    progress.value = 0;
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
    this.hideProgress();
    this.iframedoc.getElementById('cam-status').innerHTML = '';

    // hide action sheet
    this.iframedoc.getElementById('attach-image-sheet').className =
    this.iframedoc.getElementById('attach-image-sheet').className.replace(/\bactive\b/, 'hide');

    this.appbuddy = false;

  }

  uploadWin(r: FileUploadResult) {

    // console.log('uploadWin', r);

    // If the nonce fails, this could be a cookie issue. If cookie is not set, nonce will fail.
    if( r.response === 'Nonce Failed') {
      alert("Upload unsuccessful, nonce failed.")
    }

    this.findIframe();

    this.iframedoc = this.iframe.contentWindow.document;

    if(r && r.response) {
      let event = new CustomEvent('appcamera-uploadwin', {'detail': {response: r.response, iframe: this.iframe.contentWindow}});
      window.document.dispatchEvent(event);
    }

    let appcamera = this.iframe.contentWindow.window.appcamera;
    let msg = appcamera.msg.moderation;
    let status = this.iframedoc.getElementById('cam-status');

    if (!appcamera.moderation_on) {

      msg = appcamera.msg.success;
    }

    status.innerHTML = '<p>' + msg + '</p>';
    this.hideProgress();

    // clear message after 5 sec
    setTimeout( () => {
      status.innerHTML = '';
    }, 5000 );

  }

  uploadErr(FileTransferError) {
    console.warn(FileTransferError);
    console.log("download error source " + FileTransferError.source);
    console.log("download error target " + FileTransferError.target);
    console.log("upload error code " + FileTransferError.code);

    switch(FileTransferError.code) {
      case FileTransferError.FILE_NOT_FOUND_ERR:
        console.warn('Transfer error: File not found');
        break;
      case FileTransferError.INVALID_URL_ERR:
        console.warn('Transfer error: invalid URL');
        break;
      case FileTransferError.CONNECTION_ERR:
        console.warn('Transfer error: connection');
        break;
      case FileTransferError.ABORT_ERR:
        console.warn('Transfer error: abort');
        break;
      case FileTransferError.NOT_MODIFIED_ERR:
        console.warn('Transfer error: not modified');
        break;
    }

    this.hideProgress();
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