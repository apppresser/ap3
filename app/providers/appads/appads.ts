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

  createBanner( id ) {

  	if( !AdMob )
      return;

  	AdMob.createBanner({
	  adId: id,
	  position: 8, // 8 = bottom center, 2 = top center https://github.com/floatinghotpot/cordova-admob-pro/wiki/1.2-Method:-AdMob.setOptions()
	  autoShow: true
	});

  }

  interstitial( id ) {

  	if( !AdMob )
      return;

  	AdMob.prepareInterstitial({
  		adId: id, 
  		autoShow: true,
  		isTesting: true,
  		adSize: 'SMART_BANNER'
  	});

  }

}