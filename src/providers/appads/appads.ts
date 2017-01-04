import {Injectable} from '@angular/core';
import {AdMob} from 'ionic-native';

/*
  Admob

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class AppAds {

  constructor() {
  }

  setOptions() {

  	if( !AdMob )
  		return;

  	let isTesting = false;
  	// set position to top (2) or bottom (8) https://github.com/floatinghotpot/cordova-admob-pro/wiki/1.2-Method:-AdMob.setOptions()
  	let pos = 8;

  	AdMob.setOptions( {
      position: pos,
      isTesting: isTesting // receiving test ad
    });
  }

  createBanner( id ) {

    console.log('create banner ' + id);

  	if( !AdMob )
      return;

  	AdMob.createBanner({
  	  adId: id,
  	  autoShow: true
  	});

  }

  interstitial( id ) {

  	if( !AdMob )
      return;

  	AdMob.prepareInterstitial({
  		adId: id, 
  		autoShow: true,
  		adSize: 'SMART_BANNER'
  	});

  }

}