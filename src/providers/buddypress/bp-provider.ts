import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
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
  restBuddypressBase: string;
  restApbpBase: string;

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
    this.restBuddypressBase = 'wp-json/buddypress/v1/';
    this.restApbpBase = 'wp-json/ap-bp/v2/';

  }

  /**
   * Passes full route url with login data. Some routes do not require login.
   * @param {string} route
   * @param {*} login_data
   * @param {number} page
   * @returns {Promise<any>}
   */
  public getItems(route: string, login_data: any, page: number): Promise<any> {
    // set pagination
    if (!page) {
      let page = '1';
    }

    let concat: string;
    if (route.indexOf('?') >= 0) {
      concat = '&'
    } else {
      concat = '?'
    }

    let url = route + concat + 'page=' + page;

    return new Promise((resolve, reject) => {
      let headers = (login_data && login_data.access_token ? new Headers({ 'Authorization': 'Bearer ' + login_data.access_token }) : null);
      this.http.get(url, { headers: headers })
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

  /**
   * Gets item by route
   * @param {string} route
   * @param {*} login_data
   * @returns {Promise<any>}
   * @memberof BpProvider
   */
  public getItem(route: string, login_data: any): Promise<any> {
    let url = this.url + this.restBuddypressBase + route;

    return new Promise((resolve, reject) => {
      let headers = (login_data && login_data.access_token ? new Headers({ 'Authorization': 'Bearer ' + login_data.access_token }) : null);
      this.http.get(url, { headers: headers })
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

  /**
   * Gets member item by name
   * @param {string} route
   * @param {*} login_data
   * @returns {Promise<any>}
   * @memberof BpProvider
   */
  public getMemberByName(route: string, login_data: any): Promise<any> {
    let url = this.url + this.restApbpBase + route;

    return new Promise((resolve, reject) => {
      let headers = (login_data && login_data.access_token ? new Headers({ 'Authorization': 'Bearer ' + login_data.access_token }) : null);
      this.http.get(url, { headers: headers })
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

  /**
   * Gets current fields from profile
   * @param {*} login_data
   * @returns {Promise<any>}
   */
  public getFields(login_data: any): Promise<any> {
    let objectParams: any = { user_id: login_data.user_id, token: login_data.token, fetch_field_data: true };
    let route: string = this.url + this.restBuddypressBase + 'xprofile/fields';
    let params: string = this.objToParams(objectParams);

    return this.http.get(route + '?' + params, null).toPromise();
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

    let route = this.url + this.restBuddypressBase + 'activity';

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

    let route = this.url + this.restBuddypressBase + 'activity';

    let data: any = {
      content: activity.content
    };

    if( activity.parent ) {
      data.type = 'activity_comment';
      data.primary_item_id = activity.parent;
      data.secondary_item_id = activity.parent;
    }

    if( group_id ) {
      data.type = 'activity_update';
      data.primary_id = group_id;
    }

    let params = this.objToParams( data )

    return new Promise( (resolve, reject) => {
      let headers = (login_data && login_data.access_token ? new Headers({ 'Authorization': 'Bearer ' + login_data.access_token }) : null);

      // sending data as params avoids OPTIONS pre-flight request which doesn't work on some apache servers for an unknown reason
      this.http.post( route + '?' + params, null, { headers: headers } )
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

  /**
   * Updates activity item
   * @param {string} action
   * @param {*} login_data
   * @param {number} activity_id
   * @returns {Promise<any>}
   */
  public updateItem(action: string, login_data: any, activity_id: number): Promise<any> {
    let route = this.url + this.restApbpBase + 'activity/' + activity_id;
    let data = { action: action, user_id: login_data.user_id };
    let params = this.objToParams(data);

    return new Promise((resolve, reject) => {
      let headers = (login_data && login_data.access_token ? new Headers({ 'Authorization': 'Bearer ' + login_data.access_token }) : null);
      this.http.post(route + '?' + params, null, { headers: headers })
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
    let route: string = this.url + this.restBuddypressBase + 'xprofile/' + fieldId + '/data/' + login_data.user_id;
    let params: string = this.objToParams(objectParams);

    return this.http.post(route + '?' + params, null).toPromise();
  }

  /**
   * Update the profile avatar picture
   * @param {*} login_data
   * @param {string} imageUrl
   * @returns {Promise<any>}
   */
  public updateProfileAvatar(login_data: any, imageUrl: string): Promise<any> {
    let route: string = this.url + this.restBuddypressBase + 'members/' + login_data.user_id + '/avatar';

    return new Promise((resolve, reject) => {
      let imageURI = '';
      const fileTransfer: TransferObject = this.Transfer.create();
      let options: FileUploadOptions = {};

      if (imageUrl.indexOf('{') === 0) { // from cordova-plugin-camera-with-exif
        let img = JSON.parse(imageUrl);
        imageURI = img.filename;
      } else { // from cordova-plugin-camera
        imageURI = imageUrl;
      }

      let image = imageURI.substr(imageURI.lastIndexOf('/') + 1);
      let name = image.split("?")[0];
      let anumber = image.split("?")[1];

      if ('Android' === this.Device.platform) {
        image = anumber + '.jpg';
      }

      // this creates a random string based on the date
      let d = new Date().toTimeString();
      let random = d.replace(/[\W_]+/g, "").substr(0, 6);

      options = {
        fileKey: 'file',
        // prepend image name with random string to avoid duplicate upload errors
        fileName: imageURI ? random + image : random,
        mimeType: 'image/jpeg',
        httpMethod: "POST",
        chunkedMode: false
      }

      options.params = { token: login_data.token };

      fileTransfer.upload(imageURI, route, options, true).then((data) => {
        console.log(data);
        resolve(JSON.parse(data.response));
      }).catch((FileTransferError) => {
        this.handleError(FileTransferError);
        reject(FileTransferError);
      })
    }); // end promise
  }

  joinGroup( item, login_data ) {

    let route = this.url + this.restBuddypressBase + 'groups/join-group';

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

    let route = this.url + this.restBuddypressBase + 'friends/friend/' + friendId;

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

  /**
   * Accepts a friend request to the API
   * @param {number} friendId
   * @param {*} login_data
   * @returns {Promise<any>}
   */
  public acceptFriendship(friendId: number, login_data: any): Promise<any> {
    let route: string = this.url + this.restApbpBase + 'friends/requests/accept/' + friendId;
    let headers = (login_data && login_data.access_token ? new Headers({ 'Authorization': 'Bearer ' + login_data.access_token }) : null);

    return this.http.post(route, null, { headers: headers }).toPromise();
  }

  /**
   * Rejects a friend request to the API
   * @param {number} friendId
   * @param {*} login_data
   * @returns {Promise<any>}
   */
  public rejectFriendship(friendId: number, login_data: any): Promise<any> {
    let route: string = this.url + this.restApbpBase + 'friends/requests/reject/' + friendId;
    let headers = (login_data && login_data.access_token ? new Headers({ 'Authorization': 'Bearer ' + login_data.access_token }) : null);

    return this.http.post(route, null, { headers: headers }).toPromise();
  }

  /**
   * Sends a message to receipient or more using an existing thread id or not
   * @param {*} recipients
   * @param {*} login_data
   * @param {string} subject
   * @param {string} content
   * @param {number} threadId
   * @returns {Promise<any>}
   */
  public sendMessage(recipients: any, login_data: any, subject: string, content: string, threadId: number): Promise<any> {
    if (!subject) {
      subject = ''
    }

    let route = this.url + this.restBuddypressBase + 'messages';

    let data: any = {
      recipients: recipients,
      subject: subject,
      content: content
    };

    if (threadId) {
      data.thread_id = threadId;
    }

    let params = this.objToParams(data)

    return new Promise((resolve, reject) => {
      let headers = (login_data && login_data.access_token ? new Headers({ 'Authorization': 'Bearer ' + login_data.access_token }) : null);
      this.http.post(route + '?' + params, null, { headers: headers })
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

  /**
   * Sends an image as a private message (@TODO refactor this when testing on device)
   *
   * @param {*} recipients
   * @param {*} login_data
   * @param {string} image
   * @param {number} threadId
   * @returns {Promise<any>}
   */
  sendMessageWithImage(recipients: any, login_data: any, imageUrl: string, threadId: number): Promise<any> {
    let route: string = this.url + this.restBuddypressBase + 'messages';

    return new Promise((resolve, reject) => {
      let imageURI = '';
      const fileTransfer: TransferObject = this.Transfer.create();
      let options: FileUploadOptions = {};

      if (imageUrl.indexOf('{') === 0) { // from cordova-plugin-camera-with-exif
        let img = JSON.parse(imageUrl);
        imageURI = img.filename;
      } else { // from cordova-plugin-camera
        imageURI = imageUrl;
      }

      let image = imageURI.substr(imageURI.lastIndexOf('/') + 1);
      let name = image.split("?")[0];
      let anumber = image.split("?")[1];

      if ('Android' === this.Device.platform) {
        image = anumber + '.jpg';
      }

      // this creates a random string based on the date
      let d = new Date().toTimeString();
      let random = d.replace(/[\W_]+/g, "").substr(0, 6);
      let headers = (login_data && login_data.access_token ? new Headers({ 'Authorization': 'Bearer ' + login_data.access_token }) : null);

      options = {
        fileKey: 'message_image',
        // prepend image name with random string to avoid duplicate upload errors
        fileName: imageURI ? random + image : random,
        mimeType: 'image/jpeg',
        httpMethod: "POST",
        headers: headers,
        chunkedMode: false
      }

      let params: any = {
        recipients: recipients.join(), // convert recipients array into comma separated string
        content: '', // this is used because it is required from the buddypress REST-API, do not change this as it will be overwriten by the AppCommunity plugin.
        thread_id: threadId
      };

      options.params = params;

      fileTransfer.upload(imageURI, route, options, true).then((data) => {
        console.log(data)
        resolve(JSON.parse(data.response))
      }).catch((FileTransferError) => {
        this.handleError(FileTransferError);
        reject(FileTransferError)
      })
    }); // end promise
  }

  getNotifications( login_data ) {

    let headers = (login_data && login_data.access_token ? new Headers({ 'Authorization': 'Bearer ' + login_data.access_token }) : null);

    return new Promise( (resolve, reject) => {
      this.http.get( this.url + this.restBuddypressBase + 'notifications', { headers: headers } )
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
      component: notification.component,
      action: notification.action
    };

    let params = this.objToParams( data )

    return new Promise( (resolve, reject) => {

      let headers = (login_data && login_data.access_token ? new Headers({ 'Authorization': 'Bearer ' + login_data.access_token }) : null);
      this.http.post( this.url + this.restApbpBase + 'notifications?' + params, null, { headers: headers } )
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