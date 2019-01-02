import {Injectable} from '@angular/core';
import {Device} from '@ionic-native/device';
import {InAppPurchase} from '@ionic-native/in-app-purchase';
import {Storage} from '@ionic/storage';
import {AppAds} from '../appads/appads';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import {Platform} from 'ionic-angular';

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
    public appads: AppAds,
    public storage: Storage,
    public http: HttpClient,
    public platform: Platform
    ) {

    let item = window.localStorage.getItem( 'myappp' );
    this.wpUrl = JSON.parse( item ).wordpress_url;

    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    }

  }

  // buy a product, requires ID that looks like this: com.artofmanliness.artofmanliness.noadssubscription
  buy( id, login = false, form = null ) {

    this.storage.set('iap_product_id', id)

    // we have to get products before we can buy
    this.iap.getProducts( [ id ] ).then( products => {

      // after we get product, buy it
      this.iap.buy( id ).then( result => {

        this.storage.set('purchases', id )

        // if( login ) {
        //   this.handleLogin( form )
        // }

      })
      .catch( err => {
        alert(err)
        console.log(err)
      })

    })
    .catch( err => {
      alert(err)
      console.log(err)
    })

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

          this.storage.set('purchases', id )

          resolve( result.transactionId )

        })
        .catch( err => {
          alert(err.errorMessage)
          console.log(err)
          reject()
        })

      })
      .catch( err => {
        alert(err.errorMessage)
        console.log(err)
        reject()
      })

    }) // end promise

  }

  restoreSubscription( id ) {

    this.productId = id;

    this.storage.set('iap_product_id', id)

    return new Promise(resolve => {

      this.iap.restorePurchases().then( result => {

        for (var i = 0; i < result.length; ++i) {

          // TODO: check result[i].state for cancelled or refunded

          if( result[i].productId == this.productId ) {

            this.storage.set('purchases', this.productId )

            console.log('restore receipt, need original transaction id', result[i] )

            // TODO: not sure if result[i].transactionId is defined
            resolve( result[i].transactionId )

            return;

          }

        }

        alert('No purchases found to restore.')

        resolve(false)
        
      })
      .catch( err => {
        let error = 'Error, please try again.';

        if( err && err.message ) {
          error = err.message
        } else if( err && err.errorMessage ) {
          error = err.errorMessage
        }

        alert( error )
        console.log(err)
      })
    });

  }

  // buy a product, then remove ads. Used in AOM app
  subscribeNoAds( id ) {

    // we have to get products before we can buy
    this.iap.getProducts( [ id ] ).then( products => {

      // after we get product, buy it
      this.iap.subscribe( id ).then( result => {

        this.storage.set('purchased_ad_removal', true )

        this.appads.hideAll();

      })
      .catch( err => {
        let error = 'Error, please try again.';

        if( err && err.message ) {
          error = err.message
        } else if( err && err.errorMessage ) {
          error = err.errorMessage
        }

        alert( error )
        console.log(err)
      })

    })
    .catch( err => {

      let error = 'Error, please try again.';

      if( err && err.message ) {
        error = err.message
      } else if( err && err.errorMessage ) {
        error = err.errorMessage
      }

      alert( error )
      console.log(err)
    })

  }

  // used in AOM app
  restoreNoAds( id ) {

    this.productId = id;

    return new Promise(resolve => {

      this.iap.restorePurchases().then( result => {

        for (var i = 0; i < result.length; ++i) {

          // TODO: check result[i].state for cancelled or refunded

          if( result[i].productId == this.productId ) {

            this.storage.set('purchased_ad_removal', true )

            this.appads.hideAll();

            alert("Purchase restored, thank you!")

            resolve(result)

            return;

          }

        }

        alert('No purchases found to restore.')

        resolve(result)
        
      })
      .catch( err => {
        let error = 'Error, please try again.';

        if( err && err.message ) {
          error = err.message
        } else if( err && err.errorMessage ) {
          error = err.errorMessage
        }

        alert( error )
        console.log(err)
      })
    });

  }

  // Validate an in app purchase subscription
  // First we get the receipt, which is an array with all purchases
  // Apple requires us to make sure the receipt is not valid, apparently they are easy to fake
  // Next we see if this productId is in that array, and has a recent purchase
  // For iOS we have to send the receipt to the server to parse and see if it's valid
  // more info https://github.com/AlexDisler/cordova-plugin-inapppurchase/issues/32
  validatePurchase() {

    // nested promises, oh my!
    return new Promise( (resolve, reject) => {

      this.storage.get( 'iap_product_id' ).then( productId => {

        if ( this.platform.is('android') ) {

          this.iap.restorePurchases().then( result => {

            console.log('checkStatus restore purchase android', result)

            let validity = false;

            for (var i = 0; i < result.length; ++i) {

              if( result[i].productId == productId ) {

                console.log('purchase is valid')

                validity = true;

              }

            }

            console.log('validity ' + validity)

            resolve( validity )

          })

        } else if ( this.platform.is('ios') ) {

          // proceed with iOS

          // first, ask Apple for the receipt. We get back an encrypted string.
          this.iap.getReceipt()
          .then( receipt => {

            console.log('encoded', receipt)
            
            return receipt

          })
          .then( receiptData => {

            // next, validate the encoded receipt with Apple, and get back the human readable format
            this.validateReceiptIos( receiptData ).then( receipt => {

              console.log('validate receipt response', receipt)

              // finally, send the receipt to the server and resolve the promise with the result. This is the final validity response that is returned
              this.sendIosReceiptToServer(receipt, productId).then( validity => {
                console.log('validity response', validity)
                resolve( validity )
              }).catch( err => {
                reject( err )
              })

            }).catch( err => {
              console.warn(err)
              reject( err )
            })

          })
          .catch( err => {

            reject( err )
            console.warn(err)

          })

        } // end if platform.is

      }) // end storage.get

    }) // end promise

  }

  // validate the encoded receipt with Apple, and get back the human readable format
  // https://developer.apple.com/library/archive/releasenotes/General/ValidateAppStoreReceipt/Chapters/ValidateRemotely.html
  validateReceiptIos( receiptData ) {

    return new Promise( ( resolve, reject ) => {

      this.storage.get('iap_secret').then( secret => {

        if( !secret ) {
          alert('Missing iOS in app purchase secret.')
          resolve(false);
        }

        let data = {
          'password': secret,
          'receipt-data': receiptData,
          'exclude-old-transactions': true
        }

        // prod: https://buy.itunes.apple.com/verifyReceipt
        // sandbox: https://sandbox.itunes.apple.com/verifyReceipt
        this.http.post( 'https://sandbox.itunes.apple.com/verifyReceipt', data, this.httpOptions )
            .subscribe(response => {

              console.log('verify receipt response', response)

              if( response ) {
                let receipt = (<any>response).latest_receipt_info
                console.log(receipt)
                resolve(receipt)
                // purchases can be found at receipt.in_app <Array>
                // will need to loop through them and get most recent, then work with expiration date
              } else {
                console.warn(response)
                reject( response )
              }
              
            },
            error => {
              reject(error)
              console.log(error);
            })

      }) // end storage.get

    })

  }

  sendIosReceiptToServer( receipt, productId ) {

    return new Promise( ( resolve, reject ) => {

      // get username so we can potentially cancel membership
      this.storage.get('user_login').then( userlogin => {

        let username = ''

        if( userlogin && userlogin.username ) {
          username = userlogin.username
        }

        console.log( 'sendIosReceiptToServer', receipt )

        let url = this.wpUrl + 'wp-json/appp/v1/in-app-purchase-validate'

        let data = {
          sec: 'jk39DLKj!',
          receipt: JSON.stringify( receipt ),
          username: username,
          product_id: productId
        }

        this.http.post( url, data, this.httpOptions )
          .subscribe(response => {

            console.log('server response', response)
            resolve( response );

          },
          error => {
            reject( error )
            // probably a bad url or 404
            console.log(error);
          })

      });

    })

  }

  // a much simpler way to check iOS iap status using status update notifications
  // the server handles everything, we just check periodically for a boolean status
  getSubscriptionStatus( user_id ) {

    return new Promise( (resolve, reject) => {

      this.storage.get( 'iap_product_id' ).then( productId => {

        if ( this.platform.is('android') ) {

          this.validateAndroidReceipt( productId ).then( response => {
            resolve( response )
          })

        } else {

          this.validateIosRemotely( user_id, productId ).then( response => {
            resolve( response )
          }).catch( err => {
            reject(err)
          })

        }

      }) // end storage.get

    }) // end promise

  }

  validateAndroidReceipt( productId ) {

    return new Promise( (resolve, reject) => {

      this.iap.restorePurchases().then( result => {

          console.log('checkStatus restore purchase android', result)

          let validity = false;

          for (var i = 0; i < result.length; ++i) {

            if( result[i].productId == productId ) {

              console.log('purchase is valid')

              validity = true;

            }

          }

          console.log('validity ' + validity)

          resolve( validity )

        })

      resolve(true)

    })

  }

  validateIosRemotely( user_id, productId ) {

    return new Promise( (resolve, reject) => {

      this.http.get( this.wpUrl + 'wp-json/appp/v1/in-app-purchase-status?user_id=' + user_id + '&product_id=' + productId )
        .subscribe(response => {

          console.log('iap check response', response)
          resolve( response );

        },
        error => {
          reject( false )
          // probably a bad url or 404
          console.warn(error);
        })

      })

  }

}