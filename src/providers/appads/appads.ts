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

  setOptions(options) {

  	if( !AdMob )
  		return;

  	let isTesting = ( options.admob_isTesting === 'on' );
  	// set position to top (2) or bottom (8) https://github.com/floatinghotpot/cordova-admob-pro/wiki/1.2-Method:-AdMob.setOptions()
  	let pos = ( options.admob_bannerAtTop === 'on' ) ? 2 : 8;

  	AdMob.setOptions( {
      position: pos,
      offsetTopBar: true, // set to true to avoid ios7 status bar overlap 
      isTesting: isTesting // receiving test ad
    });
  }

  createBanner( id ) {

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