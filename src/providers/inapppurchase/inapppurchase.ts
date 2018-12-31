import {Injectable} from '@angular/core';
import {Device} from '@ionic-native/device';
import {InAppPurchase} from '@ionic-native/in-app-purchase';
import {Storage} from '@ionic/storage';
import {AppAds} from '../appads/appads';

/*
  In App Purchases

  See http://ionicframework.com/docs/native/in-app-purchase/
  and https://github.com/AlexDisler/cordova-plugin-inapppurchase
*/
@Injectable()
export class IAP {

  productId: string;

  constructor( 
    private iap: InAppPurchase,
    public appads: AppAds,
    public storage: Storage
    ) {
  }

  // buy a product, requires ID that looks like this: com.artofmanliness.artofmanliness.noadssubscription
  buy( id, login = false, form = null ) {

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

    return new Promise( (resolve, reject) => {

      // we have to get products before we can buy
      this.iap.getProducts( [ id ] ).then( products => {

        // after we get product, buy it
        this.iap.subscribe( id ).then( result => {

          this.storage.set('purchases', id )

          resolve( true )

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

    return new Promise(resolve => {

      this.iap.restorePurchases().then( result => {

        for (var i = 0; i < result.length; ++i) {

          // TODO: check result[i].state for cancelled or refunded

          if( result[i].productId == this.productId ) {

            this.storage.set('purchases', this.productId )

            resolve(true)

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

}