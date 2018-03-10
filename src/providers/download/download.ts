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

  constructor(
  	public http: Http,
  	public events: Events,
    private transfer: FileTransfer
  	) {
  }

  downloadFile( filePath ) {

    console.log( cordova.file.dataDirectory, filePath )

  	// simulate progress
  	this.events.publish('load:progress', 10);

  	setTimeout( () => {
  		this.events.publish('load:progress', 30);
  	}, 300);

  	return new Promise( (resolve, reject) => {

	  	const fileTransfer: FileTransferObject = this.transfer.create();

      fileTransfer.onProgress( data => {

        if( progressEvent.loaded < 71 )
          this.events.publish('load:progress', progressEvent.loaded + 30 );

      })

      let filename = filePath.replace(/^.*[\\\/]/, '')

  		fileTransfer.download( filePath, cordova.file.dataDirectory + '/media/' + filename ).then((entry) => {

        console.log('file download success', entry)

  			this.events.publish('load:progress', 80);

  			resolve( entry.toURL() );

  		}, (error) => {
        console.log(error)
  			reject( JSON.stringify( error ) );
  			this.events.publish('load:progress', 0);
  		});

  	});
  }

}