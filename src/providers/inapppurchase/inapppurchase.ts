import {Injectable} from '@angular/core';
import {Device} from '@ionic-native/device';
import {InAppPurchase} from '@ionic-native/in-app-purchase';
import {Storage} from '@ionic/storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import {Platform} from 'ionic-angular';
import { LoginService } from '../logins/login.service';

/*
  In App Purchases

  See http://ionicframework.com/docs/native/in-app-purchase/
  and https://github.com/AlexDisler/cordova-plugin-inapppurchase
*/
@Injectable()
export class IAP {

  productId: string;
  wpUrl: string;
  httpOptions: any;

  constructor( 
    private iap: InAppPurchase,
    public storage: Storage,
    public http: HttpClient,
    public loginService: LoginService,
    public platform: Platform
    ) {

    let item = window.localStorage.getItem( 'myappp' );

    if( item )
      this.wpUrl = JSON.parse( item ).wordpress_url;

    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + this.loginService.user.access_token 
      })
    }

  }

  // buy a product
  buy( id, form = null ) {

    return new Promise( ( resolve, reject ) => {

      // we have to get products before we can buy
      this.iap.getProducts( [ id ] ).then( products => {

        // after we get product, buy it
        this.iap.buy( id ).then( result => {

          this.storage.get('iap_purchase_ids').then( ids => {
            if( ids ) {
              ids.push(id)
            } else {
              ids = [id]
            }
            this.storage.set('iap_purchase_ids', ids )
          })

          resolve( result )

        })
        .catch( err => {
          let error = this.getErrMsg( err )
          reject(error)
          console.log(err)
        })

      })
      .catch( err => {
        let error = this.getErrMsg( err )
        reject(error)
        console.log(err)
      })

    }) // end promise

  }

  // generic restore purchase
  restorePurchase( id, form = null ) {

    console.log('restore ' + id, form)

    this.productId = id;

    return new Promise( ( resolve, reject ) => {

      this.iap.restorePurchases().then( result => {

        for (var i = 0; i < result.length; ++i) {

          // TODO: check result[i].state for cancelled or refunded

          if( result[i].productId == this.productId ) {

            this.storage.get('iap_purchase_ids').then( ids => {
              if( ids ) {
                ids.push(this.productId)
              } else {
                ids = [this.productId]
              }
              this.storage.set('iap_purchase_ids', ids )
            })

            resolve(result)

            return;

          }

        }

        reject("No purchases found to restore.")
        
      })
      .catch( err => {
        let error = this.getErrMsg( err )

        reject( error )
        console.log(err)
      })
    });

  }

  // subscribe to an app store purchase
  subscribe( id ) {

    this.storage.set('iap_product_id', id)

    return new Promise( (resolve, reject) => {

      // we have to get products before we can buy
      this.iap.getProducts( [ id ] ).then( products => {

        // after we get product, buy it
        this.iap.subscribe( id ).then( result => {

          console.log('subscribe receipt', result)

          this.storage.set('iap_subscription', id )

          resolve( result.transactionId )

        })
        .catch( err => {
          let error = this.getErrMsg(err)
          reject( error )
        })

      })
      .catch( err => {
        let error = this.getErrMsg(err)
        reject( error )
      })

    }) // end promise

  }

  restoreSubscription( id ) {

    this.productId = id;

    this.storage.set('iap_product_id', id)

    return new Promise( (resolve, reject) => {

      this.iap.restorePurchases().then( result => {

        // this is an array of purchases
        //console.log( 'restore purchases result', result )

        for (var i = 0; i < result.length; ++i) {

          // TODO: check result[i].state for cancelled or refunded

          if( result[i].productId == this.productId ) {

            this.storage.set('iap_subscription', this.productId )

            // we aren't using this transaction ID
            resolve( result[i].transactionId )

            return;

          }

        }

        reject( 'No purchases found to restore.' )
        
      })
      .catch( err => {
        let error = this.getErrMsg(err)
        reject( error )
      })
    });

  }

  // buy a product, then remove ads. Used in AOM app
  // subscribeNoAds( id ) {

  //   // we have to get products before we can buy
  //   this.iap.getProducts( [ id ] ).then( products => {

  //     // after we get product, buy it
  //     this.iap.subscribe( id ).then( result => {

  //       this.removeAds()

  //     })
  //     .catch( err => {
  //       let error = 'Error, please try again.';

  //       if( err && err.message ) {
  //         error = err.message
  //       } else if( err && err.errorMessage ) {
  //         error = err.errorMessage
  //       }

  //       alert( error )
  //       console.log(err)
  //     })

  //   })
  //   .catch( err => {

  //     let error = this.getErrMsg( err )

  //     alert( error )
  //     console.log(err)
  //   })

  // }

  // a much simpler way to check iOS iap status using status update notifications
  // the server handles everything, we just check periodically for a boolean status
  // Returns: boolean
  getSubscriptionStatus( user_id ) {

    return new Promise( (resolve, reject) => {

      this.storage.get( 'iap_product_id' ).then( productId => {

        if ( this.platform.is('android') ) {

          this.validateAndroid( user_id, productId ).then( response => {
            resolve( response )
          }).catch( err => {
            reject( err )
          })

        } else {

          this.validateIosRemotely( user_id, productId ).then( response => {
            resolve( response )
          }).catch( err => {
            let error = this.getErrMsg( err )
            reject( error )
          })

        }

      }) // end storage.get

    }) // end promise

  }

  validateAndroid( user_id, productId ) {

    return new Promise( (resolve, reject) => {

      this.iap.restorePurchases().then( result => {

        console.log('Restore purchase android', result)

        // when an Android subscription expires, restorePurchases is empty. We still send to the server

        // send receipts to server to validate
        this.validateAndroidRemotely( user_id, result, productId ).then( validity => {
          resolve( validity )
        }).catch( err => {
          let error = this.getErrMsg( err )
          reject( error )
        })

          
        /*
         * We could validate on the device like this, but then the server wouldn't be able to cancel memberships.
        for (var i = 0; i < result.length; ++i) {

          if( result[i].productId == productId ) {

            console.log('purchase is valid')

            validity = true;

          }

        } */

      }) // end restore purchases

    }) // end promise

  }

  // this is actually easier to do in app, but we send it to the server to allow customers to modify it easily
  validateAndroidRemotely( user_id, purchases, productId ) {

    return new Promise( (resolve, reject) => {

      let data = {
        user_id: user_id,
        sec: 'jk39DLKj!',
        purchases: JSON.stringify( purchases ),
        product_id: productId
      }

      this.http.post( this.wpUrl + 'wp-json/appp/v2/in-app-purchase-validate', data, this.httpOptions )
        .subscribe(response => {

          console.log('validateAndroidRemotely response', response)

          resolve( response );

        },
        err => {
          let error = this.getErrMsg( err )
          reject( error )
          // probably a bad url or 404
          console.warn('validateAndroidRemotely error', error);
        })

      })

  }

  // iOS doesn't validate purchases on server, because we use Apple subscription notifications. We just check for a boolean based on user meta here.
  validateIosRemotely( user_id, productId ) {

    return new Promise( (resolve, reject) => {

      this.http.get( this.wpUrl + 'wp-json/appp/v2/in-app-purchase-status?user_id=' + user_id + '&product_id=' + productId )
        .subscribe(response => {

          console.log('iap check response', response)
          resolve( response );

        },
        error => {
          reject( error )
          // probably a bad url or 404
          console.warn(error);
        })

      })

  }

  getErrMsg( err ) {

    let error;

    if( err && err.message ) {
      error = err.message
    } else if( err && err.errorMessage ) {
      error = err.errorMessage
    } else {
      error = err
    }

    return error;

  }

}