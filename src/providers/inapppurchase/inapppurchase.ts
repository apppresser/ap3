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

  // Get products
  // getProducts( id ) {

  //   console.log('getting products for ' + this.productId )

  //   return new Promise(resolve => {

  //     this.iap.getProducts( [ this.productId ] ).then( products => {
  //       console.log('got products', products)
  //       resolve(products)
  //     })
  //     .catch( err => {
  //       console.log(err)
  //     })
  //   });
  // }

  // buy a product, requires ID that looks like this: com.artofmanliness.artofmanliness.noadssubscription
  buy( id ) {

    // we have to get products before we can buy
    this.iap.getProducts( [ id ] ).then( products => {

      // after we get product, buy it
      this.iap.buy( id ).then( result => {

        this.storage.set('purchases', id )

        this.appads.hideAll();

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

  // buy a product, requires ID that looks like this: com.artofmanliness.artofmanliness.noadssubscription
  subscribe( id ) {

    // we have to get products before we can buy
    this.iap.getProducts( [ id ] ).then( products => {

      // after we get product, buy it
      this.iap.subscribe( id ).then( result => {

        this.storage.set('purchased_' + id, true )

      })
      .catch( err => {
        alert(err.errorMessage)
        console.log(err)
      })

    })
    .catch( err => {
      alert(err.errorMessage)
      console.log(err)
    })

  }

  // buy a product, then remove ads
  subscribeNoAds( id ) {

    // we have to get products before we can buy
    this.iap.getProducts( [ id ] ).then( products => {

      // after we get product, buy it
      this.iap.subscribe( id ).then( result => {

        this.storage.set('purchased_ad_removal', true )

        this.appads.hideAll();

      })
      .catch( err => {
        alert( JSON.stringify(err) )
        console.log(err)
      })

    })
    .catch( err => {
      alert( JSON.stringify(err) )
      console.log(err)
    })

  }

  // buy a product, requires ID that looks like this: com.artofmanliness.artofmanliness.noadssubscription
  // buyProduct( id ) {

  //   console.log('buying ' + id)

  //   return new Promise(resolve => {

  //     this.iap.buy( id ).then( result => {
  //       console.log('bought ', result)
  //       alert("Purchase successful, thank you!")

  //       this.appads.hideAll();

  //       resolve(result)
  //     })
  //     .catch( err => {
  //       console.log(err)
  //     })
  //   });

  // }

  restoreNoAds( id ) {

    return new Promise(resolve => {

      this.iap.restorePurchases().then( result => {
        // console.log('restored ', result)

        for (var i = 0; i < length; ++i) {

          // TODO: check result[i].state for cancelled or refunded

          if( result[i].productId = id ) {

            this.storage.set('purchased_ad_removal', true )

            this.appads.hideAll();

            alert("Purchase restored, thank you!")

            return;

          }

        }

        resolve(result)
      })
      .catch( err => {
        alert( JSON.stringify(err) )
        console.log(err)
      })
    });

  }

}