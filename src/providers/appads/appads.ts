import {Injectable} from '@angular/core';
import { AdMob, AdMobOptions, AdSize, AdExtras } from '@ionic-native/admob';

/*
  Admob

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class AppAds {

  constructor(private AdMob: AdMob) {
  }

  setOptions() {

  	if( !AdMob )
  		return;

  	let isTesting = false;
  	// set position to top (2) or bottom (8) https://github.com/floatinghotpot/cordova-admob-pro/wiki/1.2-Method:-AdMob.setOptions()
  	let pos = 8;

  	this.AdMob.setOptions( {
      position: pos,
      isTesting: isTesting // receiving test ad
    });
  }

  createBanner( id ) {

    console.log('create banner ' + id);

  	if( !this.AdMob )
      return;

  	this.AdMob.createBanner({
  	  adId: id,
  	  autoShow: true
  	});

  }

  interstitial( id ) {

  	if( !this.AdMob )
      return;

  	this.AdMob.prepareInterstitial({
  		adId: id, 
  		autoShow: true,
  		adSize: 'SMART_BANNER'
  	});

  }

}