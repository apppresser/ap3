import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import {Device} from '@ionic-native/device';

/* 
// on first load, use app-data.json file and save to localstorage.
// check if app needs update in background, set localstorage item
// on next load, if app needs update, go get new data and overwrite localstorage.
*/
@Injectable()
export class AppData {
  data: any = null;
  local: any = false;
  updateNeeded: boolean = false;
  notAuthorized: boolean = false;

  constructor(public http: Http, private Device: Device) {
  }

  /*
   * Get data in this priority:
   * 1. localStorage
   * 2. API
   * 3. app-data.json file
   * If anything fails, we go to the next one
   *
   * App is built with app-data.json file, which is never updated. Only API data and localStorage are updated, so falling back to app-data.json might break stuff, so it's a last resort.
   * If we are not on a device, always get data from the API. This makes sure the preview shows latest changes.
   * Update 8/18: need a way to update data when a new app version is released. If app-data.json ver is higher than local ver, we force an update.
   */
  load( apiurl ) {

    return new Promise( (resolve, reject) => {

      let item = window.localStorage.getItem( 'myappp' );
      this.local = JSON.parse( item );

      // convert to a constant to use in promise
      const localData = this.local
      const localVer = ( localData? localData.meta.app_update_version : null )

      // get json data first
      this.getData( 'app-data.json' ).then( jsonData => {

        this.updateNeeded = ( window.localStorage.getItem( 'myappp_update' ) == 'true' ) ? true : false;

        if( this.Device.platform != 'iOS' && this.Device.platform != 'Android' ) {
          // if we are not on a device, don't cache data. helps preview update faster
          // get data from api
          this.getData( apiurl ).then( data => {
            resolve(data);
          })
          return;
        }

        // if app-data.json version is higher, force update
        if( jsonData && localVer && parseFloat( localVer ) < parseFloat( (<any>jsonData).meta.app_update_version ) ) {

          console.log( 'get updated json' )

          resolve( jsonData );

        } else if( localData && this.updateNeeded != true ) {

          console.log('using localStorage data');

          // send back localstorage item
          resolve( localData );

        } else if( !localData && this.updateNeeded != true && jsonData ) {

          console.log('using app-data.json');

          // get local app-data file
          resolve( jsonData );

        } else {

          console.log('get data from API');

          // get data from api
          this.getData( apiurl ).then( data => {
            resolve(data);
          })
          .catch( (err) => {
              // API is down, or bad url, so we need to get app-data.json file. Send back to app.component.ts line 78
              if(err.status == 401) { // 401 not authorized
                // membership expired
                this.notAuthorized = true;
              }
              reject(err);
            }
          );

        } // end if statements
        
      }).catch( e => {

        // app-data.json is missing for some reason
        console.warn(e)

        // get data from api
        this.getData( apiurl ).then( data => {
          resolve(data);
        });

      }); // end this.getData()

    }); // end promise
  }

  getData( url: string ) {

    return new Promise( (resolve, reject) => {

      this.http.get( url )
        .map(res => res.json())
        .subscribe(data => {
            // we've got back the raw data, now generate the core schedule data
            // and save the data for later reference
            window.localStorage.removeItem( 'myappp' );
            this.local = window.localStorage.setItem( 'myappp', JSON.stringify(data) );
            resolve(data);
          },
          error => {
            // API is down, or bad url, send back to line 65
            reject(error);
          }
        );

    });
    
  }

  /* 
   * When you click "go live" in the app builder, it increments the update version, and this function tells the app to get new data on the next load.
   */
  checkForUpdates( apiurl ) {

    // if api failed once no need to try it again
    if(this.notAuthorized)
      return; // membership expired

    let item = window.localStorage.getItem( 'myappp' );
    this.local = JSON.parse( item );

    // Runs in the background, and set the app to update on the next load
    // check if local app_update_version and remote version match, set updateNeeded accordingly

    this.http.get( apiurl )
      .map(res => res.json())
      .subscribe(data => {
        // we've got back the raw data, now generate the core schedule data
        // and save the data for later reference
        if( this.local && this.local.meta && data.meta && this.local.meta.app_update_version != data.meta.app_update_version ) {

          window.localStorage.setItem( 'myappp_update', 'true' );

        } else {

          window.localStorage.removeItem( 'myappp_update' );

        }
      });
  }

  handleError(err) {
    console.warn(err);
  }
}