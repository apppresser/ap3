import {Injectable} from '@angular/core';
import {Camera} from 'ionic-native';
import {Transfer} from 'ionic-native';
import {Device} from 'ionic-native';

/*
  Generated class for the Menus provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class AppCamera {

  constructor() { }

  takePicture() {}

  photoLibrary() {

    let options = {
      quality: 30,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      correctOrientation: true,
      targetWidth: 1204,
      targetHeight: 1204
    };

    Camera.getPicture(options).then((imageData) => {
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

    let iframedoc = document.getElementById('ap3-iframe').contentWindow.document;
    let iframewin = document.getElementById('ap3-iframe').contentWindow.window;

    // console.log('imageURI', imageURI);

    let image = imageURI.substr(imageURI.lastIndexOf('/') + 1);

    let name = image.split("?")[0];
    let anumber = image.split("?")[1];
    let ajaxurl = iframewin.apppCore.ajaxurl;

    if ('Android' === Device.device.platform) {
      image = anumber + '.jpg';
    }

    // console.log(image);

    let options = new FileUploadOptions();
    options.fileKey = 'appp_cam_file';
    options.fileName = imageURI ? image : '';
    options.mimeType = 'image/jpeg';

    let params = {};
    let form_fields = [];
    let form_values = [];
    let iterator;
    let form_elements = iframedoc.getElementById('appp_camera_form').elements;

    // console.log(form_elements);

    for (iterator = 0; iterator < form_elements.length; iterator++) {
      form_fields[iterator] = form_elements[iterator].name;
      form_values[iterator] = form_elements[iterator].value;
      // console.log(form_elements[iterator].name, form_elements[iterator].value);
    }

    params.form_fields = JSON.stringify(form_fields);
    params.form_values = JSON.stringify(form_values);
    params.appp_action = 'attach';

    iframedoc.getElementById('appp_cam_post_title').value = '';
    options.params = params;

    fileTransfer.upload(imageURI, ajaxurl, options, true).then((msg) => {
      alert('Image upload success.');
    }).catch((e) => {
      console.warn(e);
    });
  }

  
}