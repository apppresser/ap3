import {Injectable} from '@angular/core';
import {GlobalVars} from '../globalvars/globalvars';
import {Device} from '@ionic-native/device';
import {InAppPurchase} from '@ionic-native/in-app-purchase';

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
    public globalvars: GlobalVars
    ) {
  }

  // Subscribe for push through our API service
  getProducts() {

    this.productId = this.globalvars.getProductId();

    console.log('getting products for ' + this.productId )

    return new Promise(resolve => {

      this.iap.getProducts( [ this.productId ] ).then( products => {
        console.log('got products', products)
        resolve(products)
      })
      .catch( err => {
        console.log(err)
      })
    });
  }

  buy( id ) {

    console.log('buying ' + id)

    return new Promise(resolve => {

      this.iap.buy( id ).then( result => {
        console.log('bought ', result)
        alert("Purchase successful! Remove ads now...")
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
        alert("Restored! Make sure ads are removed...")
        resolve(result)
      })
      .catch( err => {
        console.log(err)
      })
    });

  }

}