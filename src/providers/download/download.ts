import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import 'rxjs/add/operator/map';

import {Events} from 'ionic-angular';
import {Device} from '@ionic-native/device';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';

declare var FileUploadOptions:any;
declare var cordova: any;

@Injectable()
export class Download {

  percent: number;

  constructor(
  	public http: Http,
  	public events: Events,
    private transfer: FileTransfer
  	) {
  }

  downloadFile( filePath ) {

    // console.log( cordova.file.dataDirectory, filePath )

  	// simulate progress
  	this.events.publish('load:progress', 10);

  	const fileTransfer: FileTransferObject = this.transfer.create();

    fileTransfer.onProgress( progressEvent => {

      let percent = progressEvent.loaded / progressEvent.total * 100
      percent = Math.round( percent )

      // only send progress event when number changes
      if( percent === this.percent ) {
        return;
      }

      this.percent = percent

      // console.log(percent)
      
      if( percent > 10 ) {
        this.events.publish('load:progress', percent );
      }

    })

  	return new Promise( (resolve, reject) => {

      let filename = filePath.replace(/^.*[\\\/]/, '')
      filename = filename.replace(/[\s+]/g, '-')

  		fileTransfer.download( filePath, cordova.file.dataDirectory + '/media/' + filename ).then((entry) => {

        console.log('file download success', entry)

  			this.events.publish('load:progress', 80);

  			resolve( entry.toURL() );

  		}, (error) => {
        console.log('file download err', error)
  			reject( JSON.stringify( error ) );
  			this.events.publish('load:progress', 0);
  		});

  	});
  }

}