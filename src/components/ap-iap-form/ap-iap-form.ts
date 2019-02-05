import { Component, OnInit, Input, ContentChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Events, ToastController, LoadingController, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import {WPlogin} from '../../providers/wplogin/wplogin';
import {IAP} from '../../providers/inapppurchase/inapppurchase';
import {TranslateService} from '@ngx-translate/core';
import {AppAds} from '../../providers/appads/appads';

@Component({
  selector: 'in-app-purchase',
  templateUrl: 'ap-iap-form.html',
})
export class ApIapForm {

	@Input() productId: string;
	@Input() productIdAndroid: string;
	@Input() email: boolean = true
	@Input() firstName: boolean = false
	@Input() lastName: boolean = false
	@Input() currencySymbol: string = "$"
	@Input() isSubscription: any
	@Input() opens: number
	@Input() secret: string
	@Input() removeAds: boolean = false
	@Input() noLogin: string

	formData: any;
	loading: any;
	isIos: boolean = false;
	login_data: any;

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public storage: Storage,
		public viewCtrl: ViewController,
		public events: Events,
		public toastCtrl: ToastController,
		public loadingCtrl: LoadingController,
		public platform: Platform,
		public iap: IAP,
		public wplogin: WPlogin,
		public translate: TranslateService,
		public appads: AppAds
		) {

		this.listeners()

	}

	listeners() {

		this.events.subscribe( 'user:login', login_data => {
			if( login_data ) {
				this.login_data = login_data
			}
		})

		this.events.subscribe( 'user:logout', response => {
			this.login_data = null
		})

	}

	ngAfterViewInit() {
		if( !this.productId && !this.productIdAndroid ) {
			this.presentToast("Product ID is required.")
		}

		if( this.secret ) {
			this.storage.set( 'iap_secret', this.secret )
		}

		if( this.opens ) {
			this.storage.set( 'iap_open_count_user_setting', this.opens )
		}

		if( this.platform.is('ios') ) {
			this.isIos = true
		}

		this.storage.get('user_login').then( login_data => {

			if( login_data )
				this.login_data = login_data

		})
	}

	// If we have 2 product IDs, get the right one
	getProductId() {

		if( this.productIdAndroid && this.platform.is('android') ) {
			return this.productIdAndroid
		} else {
			return this.productId
		}

	}

	submitForm( form ) {

		let fields = form.value

		console.log(fields)

		if( this.noLogin != 'true' ) {

			// only validate if fields are needed
			if( !fields.username || !fields.password || !fields.email ) {
				this.presentToast('Please fill out all fields.')
				return;
			}

		}

		if( this.removeAds ) {
			fields.removeAds = true
		}

		if( this.login_data && this.login_data.user_id ) {
			fields.user_id = this.login_data.user_id
		}

		if( this.isSubscription != "false"  ) {

			// are we restoring a purchase?
			if( fields.restore === true ) {
				this.restoreSubscription( fields )
			} else {
				this.subscribe( fields )
			}
			
		} else {

			this.buyProduct( fields )
			
		}

	}

	buyProduct( fields ) {
		console.log('buyProduct', fields)

		let id = this.getProductId()

		if( fields.restore === true ) {

			this.iap.restorePurchase( id, fields ).then( result => {

				this.presentToast('Purchase restored!')

				if( fields.removeAds === true ) {
	              this.removeAppAds()
	            }

			}).catch( err => {
				this.presentToast("There was a problem with your purchase " + err )
			})

		} else {

			this.iap.buy( id, fields ).then( result => {

				this.purchaseSuccess( result, fields )

			}).catch( err => {

				this.presentToast("There was a problem with your purchase " + err )

			})
		}
	}

	subscribe( fields ) {

		console.log(fields)

		this.showSpinner()

		let productId = this.getProductId()

		this.iap.subscribe( productId ).then( transactionId => {

			console.log('purchase transactionId', transactionId)

			this.purchaseSuccess( transactionId, fields )

		}).catch( e => {

			console.warn(e)
			this.translate.get(e).subscribe( text => {
				this.presentToast( e )
			})

		}).then( ()=> {
			this.hideSpinner()
		});

	}

	restoreSubscription( fields ) {

		let productId = this.getProductId()

		this.iap.restoreSubscription( productId ).then( transactionId => {

			console.log(transactionId)

			// transactionID number if successful, false if no purchase to restore
			if( transactionId ) {
				// log the user in after purchase
				this.handleWpLogin( fields, null )

				if( fields.removeAds === true ) {
	              this.removeAppAds()
	            }
			}


		}).catch( e => {

			console.warn(e)

			this.translate.get(e).subscribe( text => {
				this.presentToast( e )
			})

		});

	}

	purchaseSuccess( transactionId, fields ) {

		// in some cases we don't need to communicate with WP, like for removing ads
		if( this.noLogin === "true" ) {

			this.translate.get( 'Purchase successful, thank you!' ).subscribe( text => {
				this.presentToast( text )
			})
			
		} else {
			// log the user in after purchase
			this.handleWpLogin( fields, transactionId )
		}

		// maybe remove ads
		if( fields.removeAds === true ) {
		  this.removeAppAds()
		}

	}

	// send the data to WP
	// if the user doesn't exist, register them
	// log them in and add user meta of in_app_purchase = true
	handleWpLogin( userData, transactionId ) {

		// in some cases we don't need to communicate with WP, like for removing ads
		if( this.noLogin === "true" ) {
			return;
		}

		this.showSpinner()

		this.translate.get( 'Purchase successful! Logging you in...' ).subscribe( text => {
			this.presentToast( text )
		})

		this.wplogin.iapRegisterLogIn( userData, transactionId ).then( data => {

			console.log(data)

			this.loginSuccess( data )
	
		}).catch( err => {

			console.warn(err)
			this.presentToast('There was a problem, please contact support.')
			
		}).then( () => {

			this.hideSpinner()

		})

	}

	loginSuccess( login_data ) {

		this.storage.set( 'user_login', login_data )
		this.events.publish('user:login', login_data )

		this.translate.get( "Success! Please use the app menu to access your content." ).subscribe( text => {
			this.presentToast( text )
		})

	}

	removeAppAds() {

		console.log('removing app ads')

		this.storage.set('purchased_ad_removal', true )

		this.appads.hideAll();

	}

	presentToast(msg) {

		let toast = this.toastCtrl.create({
		  message: msg,
		  duration: 3000,
		  position: 'bottom',
		  cssClass: 'normal-toast'
		});

		toast.present();

	}

	showSpinner() {

        // create only one spinner
        if(!this.loading) {
            this.loading = this.loadingCtrl.create({
                showBackdrop: false,
                dismissOnPageChange: false
            });

            this.loading.present();
        }
    }

    hideSpinner() {

    	if( this.loading )
    		this.loading.dismiss();
    }

}