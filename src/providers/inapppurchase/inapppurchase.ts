import {Injectable} from '@angular/core';
import {Device} from '@ionic-native/device';
import {InAppPurchase} from '@ionic-native/in-app-purchase';

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
    public appads: AppAds
    ) {
  }

  // Get products
  // getProducts() {

  //   this.productId = this.globalvars.getProductId();

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

    console.log('buying ' + id)

    return new Promise(resolve => {

      this.iap.buy( id ).then( result => {
        console.log('bought ', result)
        alert("Purchase successful, thank you!")

        this.appads.hideAll();

        resolve(result)
      })
      .catch( err => {
        console.log(err)
      })
    });

  }

  restore() {

    return new Promise(resolve => {

      this.iap.restorePurchases().then( result => {
        console.log('restored ', result)
        alert("Purchase restored, thank you!")

        this.appads.hideAll();

        resolve(result)
      })
      .catch( err => {
        console.log(err)
      })
    });

  }

}