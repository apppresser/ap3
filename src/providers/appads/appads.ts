import {Injectable} from '@angular/core';
import { AdMobPro, AdMobOptions, AdSize, AdExtras } from '@ionic-native/admob-pro';

/*
  Admob

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class AppAds {

  constructor(private admob: AdMobPro) {
  }

  setOptions() {

  	if( !this.admob )
  		return;

  	let isTesting = false;
  	// set position to top (2) or bottom (8) https://github.com/floatinghotpot/cordova-admob-pro/wiki/1.2-Method:-AdMob.setOptions()
  	let pos = 8;

  	this.admob.setOptions( {
      position: pos,
      isTesting: isTesting // receiving test ad
    });
  }

  createBanner( id ) {

    console.log('create banner ' + id);

  	if( !this.admob )
      return;

  	this.admob.createBanner({
  	  adId: id,
  	  autoShow: true
  	});

  }

  interstitial( id ) {

  	if( !this.admob )
      return;

  	this.admob.prepareInterstitial({
  		adId: id, 
  		autoShow: true,
  		adSize: 'SMART_BANNER'
  	});

  }

  hideAll() {

    console.log('hiding ads')

    this.admob.hideBanner();
    
  }

}