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
    let token = ( login_data ? '&token=' + login_data.token : '' );

    let concat;
    if( route.indexOf('?') >= 0 ) {
      concat = '&'
    } else {
      concat = '?'
    }

    let url = route + concat + 'page=' + page + user_id + token;

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

    let data: any = {
      user_id: login_data.user_id,
      content: activity.content,
      token: login_data.token,
    };

    if( activity.parent ) {
      data.type = 'activity_comment';
      data.parent = activity.parent;
      data.id = activity.parent;
    }

    if( group_id ) {
      data.type = 'activity_update';
      data.primary_id = group_id;
    }

    let params = this.objToParams( data )

    return new Promise( (resolve, reject) => {

      // sending data as params avoids OPTIONS pre-flight request which doesn't work on some apache servers for an unknown reason
      this.http.post( route + '?' + params, null )
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

  updateItem( action, login_data, activity_id ) {

    let route = this.url + this.restBase + 'activity/' + activity_id;

    let data = { 
      user_id: login_data.user_id,
      action: action,
      token: login_data.token
    }

    let params = this.objToParams( data )

    return new Promise( (resolve, reject) => {

      this.http.post( route + '?' + params, null )
        .map(res => res.json())
        .subscribe(data => {

            console.log(data)
          
            resolve(data)

          },
          error => {

            console.log(error)

            reject(error);

          }
        )

    }) // end promise

  }

  /**
   * Updates the specified profile field
   * @param {*} login_data
   * @param {number} fieldId
   * @param {string} fieldValue
   * @returns {Promise<any>}
   */
  public updateProfileField (login_data: any, fieldId: number, fieldValue: string): Promise<any> {
    let objectParams: any = { token: login_data.token, value: fieldValue };
    let route: string = this.url + this.restBase + 'xprofile/' + fieldId + '/data/' + login_data.user_id;
    let params: string = this.objToParams(objectParams);

    return this.http.post(route + '?' + params, null).toPromise();
  }

  /**
   * Update the profile avatar picture
   * @param {*} login_data
   * @param {string} avatar
   * @returns {Promise<any>}
   */
  public updateProfileAvatar (login_data: any, avatar: string): Promise<any> {
    let objectParams: any = { token: login_data.token };
    let route: string = this.url + this.restBase + 'members/' + login_data.user_id + '/avatar';
    let params: string = this.objToParams(objectParams);
    let body: FormData = new FormData();
    body.append('avatar', avatar);

    return this.http.post(route + '?' + params, body).toPromise();
  }

  joinGroup( item, login_data ) {

    let route = this.url + this.restBase + 'groups/join-group';

    let data = {
      user_id: login_data.user_id,
      group_id: item.id,
      token: login_data.token
    };

    let params = this.objToParams( data )

    return new Promise( (resolve, reject) => {

      this.http.post( route + '?' + params, null )
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

  doFriend( friendId, login_data, unfriend ) {

    let route = this.url + this.restBase + 'friends/friend/' + friendId;

    let action;

    if( unfriend ) {
      action = 'remove_friend'
    } else {
      action = 'add_friend'
    }

    let data = {
      action: action,
      user_id: login_data.user_id,
      token: login_data.token
    };

    let params = this.objToParams( data )

    return new Promise( (resolve, reject) => {

      this.http.post( route + '?' + params, null )
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

  acceptWithdrawFriendship( friendId, login_data, withdraw ) {

    let route = this.url + this.restBase + 'friends/requests/' + friendId;

    let action;

    if( withdraw ) {
      action = 'withdraw'
    } else {
      action = 'accept'
    }

    let data = {
      action: action,
      user_id: login_data.user_id,
      token: login_data.token
    };

    let params = this.objToParams( data )

    return new Promise( (resolve, reject) => {

      this.http.post( route + '?' + params, null )
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

  sendMessage( recipients, login_data, subject, content, threadId ) {

    if( !subject ) {
      subject = ''
    }

    let route = this.url + this.restBase + 'messages/send';

    let data: any = {
      recipients: recipients,
      subject: subject,
      content: content,
      user_id: login_data.user_id,
      token: login_data.token,
    };

    if(threadId) {
      data.thread_id = threadId;
    }

    let params = this.objToParams( data )

    return new Promise( (resolve, reject) => {

      this.http.post( route + '?' + params, null )
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

  getNotifications( login_data ) {

    // let user_id = ( login_data && login_data.user_id ? '&user_id=' + login_data.user_id : '' );
    // let token = ( login_data ? '&token=' + login_data.token : '' );

    let data = '?user_id=' + login_data.user_id + '&token=' + login_data.token;

    return new Promise( (resolve, reject) => {

      this.http.get( this.url + this.restBase + 'notifications' + data )
          .map(res => res.json())
          .subscribe(data => {
              resolve( data );
          },
          error => {
            // probably a bad url or 404
            reject(error);
          })
    });

  }

  clearNotification( notification, login_data ) {

    let data = {
      user_id: (login_data && login_data.user_id) ? login_data.user_id : '',
      token: (login_data && login_data.token) ? login_data.token : '',
      component: notification.component,
      action: notification.action
    };

    let params = this.objToParams( data )

    return new Promise( (resolve, reject) => {

      this.http.post( this.url + this.restBase + 'notifications?' + params, null )
          .map(res => res.json())
          .subscribe(data => {
              resolve( data );
          },
          error => {
            // probably a bad url or 404
            reject(error);
          })
    });

  }

  objToParams( data ) {

    return Object.keys(data).map(function(k) {
        return encodeURIComponent(k) + "=" + encodeURIComponent(data[k]);
    }).join('&');
  }

  handleError(err) {
    console.warn(err);
  }
}