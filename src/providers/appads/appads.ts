import {Injectable} from '@angular/core';
import { AdMobFree } from '@ionic-native/admob-free';

/*
  Admob

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class AppAds {

  constructor(private admobFree: AdMobFree) {
  }

  setOptions() {

  	if( !this.admobFree )
  		return;

  }

  createBanner( id ) {

    console.log('create banner ' + id);

    this.admobFree.banner.config( {
     id: id,
     isTesting: false,
     autoShow: true
    } );

  	this.admobFree.banner.prepare()
    .then(() => {
      console.log('show banner')
    })
    .catch(e => console.log(e));

  }

  // interstitial( id ) {

  // 	if( !this.admob )
  //     return;

  // 	this.admob.prepareInterstitial({
  // 		adId: id, 
  // 		autoShow: true,
  // 		adSize: 'SMART_BANNER'
  // 	});

  // }

  hideAll() {

    console.log('hiding ads')

    this.admobFree.banner.hide()
    
  }

}