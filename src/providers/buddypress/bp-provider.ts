import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import {Camera} from '@ionic-native/camera';
import { Transfer, FileUploadOptions, TransferObject, FileUploadResult } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { Device } from "@ionic-native/device";
import { ActionSheet, ActionSheetOptions } from '@ionic-native/action-sheet';

/* 
 * Services for BuddyPress API
*/
@Injectable()
export class BpProvider {
  data: any = null;
  url: string;
  restBase: string;

  options: any = {
    quality: 50,
    destinationType: this.Camera.DestinationType.FILE_URI,
    correctOrientation: true,
    targetWidth: 1204,
    targetHeight: 1204
  };

  constructor(
    private http: Http,
    private actionSheet: ActionSheet, 
    private Camera: Camera, 
    private Device: Device, 
    private Transfer: Transfer, 
    private File: File
  ) {

    let item = window.localStorage.getItem( 'myappp' );
    this.url = JSON.parse( item ).wordpress_url;
    this.restBase = 'wp-json/ap-bp/v1/'

  }

  // pass full route url with login data. Some routes do not require login.
  getItems( route, login_data, page ) {

    // set pagination
    if( !page ) {
      let page = '1';
    }

    let user_id = ( login_data && login_data.user_id ? '&user_id=' + login_data.user_id : '' );
    let token = ( login_data ? '&token=' +login_data.token : '' );

    let concat;
    if( route.indexOf('?') >= 0 ) {
      concat = '&'
    } else {
      concat = '?'
    }

    let url = route + concat + 'page=' + page + user_id + token;

    console.log(url)

    return new Promise( (resolve, reject) => {

      this.http.get( url )
          .map(res => res.json())
          .subscribe(data => {
              resolve(data);
          },
          error => {
            // probably a bad url or 404
            reject(error);
          })
    });

  }

  getItem( route, login_data ) {

    let concat;
    if( route.indexOf('?') >= 0 ) {
      concat = '&'
    } else {
      concat = '?'
    }

    let user_id = ( login_data && login_data.user_id ? 'user_id=' + login_data.user_id : '' );
    let token = ( login_data && login_data.token && login_data.user_id ? '&token=' + login_data.token : '' );

    let url = this.url + this.restBase + route;
    url = url + concat + user_id + token;

    console.log( url )

    return new Promise( (resolve, reject) => {

      this.http.get( url )
          .map(res => res.json())
          .subscribe(data => {
              resolve(data);
          },
          error => {
            // probably a bad url or 404
            reject(error);
          })
    });

  }

  doCamera( type ) {

    if( type === 'camera' ) {
      this.options.sourceType = this.Camera.PictureSourceType.CAMERA;
    } else {
      this.options.sourceType = this.Camera.PictureSourceType.PHOTOLIBRARY;
    }

    return new Promise( (resolve, reject) => {

      this.Camera.getPicture(this.options).then((imageData) => {
        // imageData is either a base64 encoded string or a file URI
        // If it's base64:
        // let base64Image = "data:image/jpeg;base64," + imageData;
        resolve( imageData );

      }, (err) => {

        alert(err);
        reject( err );
        
      })

    });

  }

  /* Returns promise. 
   */
  postWithImage( login_data, activity, camImage, group_id ) {

    if( !activity.content && camImage ) {
      // let people post only an image
      activity.content = '';
    }

    let route = this.url + this.restBase + 'activity';

    return new Promise( (resolve, reject) => {

      let imageURI = '';

      const fileTransfer: TransferObject = this.Transfer.create();
      let options: FileUploadOptions = {};

      if(camImage.indexOf('{') === 0) { // from cordova-plugin-camera-with-exif
        let img = JSON.parse(camImage);
        imageURI = img.filename;
      } else { // from cordova-plugin-camera
        imageURI = camImage;
      }

      let image = imageURI.substr(imageURI.lastIndexOf('/') + 1);

      let name = image.split("?")[0];
      let anumber = image.split("?")[1];

      if ('Android' === this.Device.platform) {
        image = anumber + '.jpg';
      }

      // this creates a random string based on the date
      let d = new Date().toTimeString();
      let random = d.replace(/[\W_]+/g, "").substr(0,6);

      options = {
        fileKey: 'activity_image',
        // prepend image name with random string to avoid duplicate upload errors
        fileName: imageURI ? random + image : random,
        mimeType: 'image/jpeg',
        httpMethod: "POST",
        chunkedMode: false
      }

      let params = {
        content: activity.content,
        user_id: login_data.user_id,
        token: login_data.token
      }

      if( group_id ) {
        params['primary_id'] = group_id
      }

      options.params = params;

      fileTransfer.upload(imageURI, route, options, true).then((data) => {
        console.log(data)
        resolve( JSON.parse( data.response ) )
      }).catch((FileTransferError) => {
        this.handleError(FileTransferError);
        reject(FileTransferError)
      })

    }) // end promise
    
  }

  /* Returns promise. 
   */
  postTextOnly( login_data, activity, group_id ) {

    let route = this.url + this.restBase + 'activity';

    let data = 'user_id=' + login_data.user_id + '&content=' + activity.content + '&token=' + login_data.token;

    if( activity.parent ) {
      data += '&type=activity_comment&parent=' + activity.parent + '&id=' + activity.parent
    }

    if( group_id ) {
      data += '&type=activity_update&primary_id=' + group_id
    }

    return new Promise( (resolve, reject) => {

      this.http.post( route + '?' + data, null )
        .map(res => res.json())
        .subscribe(data => {
          
            resolve(data)

          },
          error => {

            console.log(error)

            reject(error);

          }
        )

    }) // end promise

  }

  favorite( login_data, activity_id ) {

    let route = this.url + this.restBase + 'activity/' + activity_id;

    let data = 'user_id=' + login_data.user_id + '&action=activity_favorite&token=' + login_data.token;

    return new Promise( (resolve, reject) => {

      this.http.put( route + '?' + data, null )
        .map(res => res.json())
        .subscribe(data => {
          
            resolve(data)

          },
          error => {

            console.log(error)

            reject(error);

          }
        )

    }) // end promise

  }

  joinGroup( item, login_data ) {

    let route = this.url + this.restBase + 'groups/join-group';

    let data = 'user_id=' + login_data.user_id + '&group_id=' + item.id + '&token=' + login_data.token;

    return new Promise( (resolve, reject) => {

      this.http.post( route + '?' + data, null )
        .map(res => res.json())
        .subscribe(data => {
          
            resolve(data)

          },
          error => {

            console.log(error)

            reject(error);

          }
        )

    }) // end promise

  }

  handleError(err) {
    console.warn(err);
  }
}