import {Component} from '@angular/core';
import { GoogleMap, GoogleMapsEvent, Geolocation } from 'ionic-native';

@Component({
  templateUrl: 'build/pages/google-map/google-map.html'
})
export class MapPage {
  constructor( ) {
  	console.log('map page loaded');
  }

  ionViewWillEnter(): void {
  	// fix for map showing black screen
    document.getElementsByClassName('nav-decor')[2].className += ' hide';
    document.getElementsByClassName('nav-decor')[3].className += ' hide';
  }

  ionViewDidEnter() {
  	this.doMap();
  }

  ionViewWillLeave(): void {
  	// fix for map showing black screen
    document.getElementsByClassName('nav-decor')[2].className = 'nav-decor';
    document.getElementsByClassName('nav-decor')[3].className = 'nav-decor';
  }

  doMap() {

  	if( plugin.google ) {

  		let mapDiv = document.getElementById("google-map");

  		// Do this when checkin button clicked
      Geolocation.getCurrentPosition().then((position) => {

          let latitude = position.coords.latitude;
          let longitude = position.coords.longitude;

          let pos = new plugin.google.maps.LatLng(latitude,longitude);

          // Initialize the map plugin
        	let map = plugin.google.maps.Map.getMap(mapDiv, {
        	      'camera': {
        	      'latLng': pos,
        	      'zoom': 10
        	    }
      	  });

  			  map.addMarker({
    		      'position': pos,
    		      'title': "You are here"
    		    }, function(marker) {

    		      marker.showInfoWindow();

    		  });

      }); // end Geolocation.getCurrentPosition

	  } // end if plugin.google
  }
  
}
