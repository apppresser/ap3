import { Component, OnInit, Input, ContentChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Events, ToastController, LoadingController, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import {WPlogin} from '../../providers/wplogin/wplogin';
import {IAP} from '../../providers/inapppurchase/inapppurchase';

@Component({
  selector: 'in-app-purchase',
  templateUrl: 'ap-iap-form.html',
})
export class ApIapForm {

	@Input() productId: string;
	@Input() email: boolean = true
	@Input() firstName: boolean = false
	@Input() lastName: boolean = false
	@Input() currencySymbol: string = "$"
	@Input() isSubscription: boolean = true

	formData: any;
	loading: any;

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
		public wplogin: WPlogin
		) {
	}

	ngAfterViewInit() {
		if( !this.productId || this.productId === '' ) {
			this.presentToast("Product ID is required.")
		}
	}

	submitForm( form ) {

		let fields = form.value

		console.log(fields)

		if( !fields.username || !fields.password || !fields.email ) {
			this.presentToast('Please fill out all fields.')
			return;
		}

		if( this.isSubscription ) {

			// are we restoring a purchase?
			if( fields.restore === true ) {
				this.restoreSubscription( fields )
			} else {
				this.subscribe( fields )
			}
			
		} else {
			this.buyProduct()
		}

	}

	buyProduct() {
		this.iap.buy( this.productId );
	}

	subscribe( fields ) {

		console.log(fields)

		this.iap.subscribe( this.productId ).then( ret => {

			console.log(ret)

			// log the user in after purchase
			this.handleWpLogin( this.formData )


		}).catch( e => {

			console.warn(e)
			this.presentToast('There was a problem with your purchase, please try again.')

		});

	}

	restoreSubscription( fields ) {

		this.iap.restoreSubscription( this.productId ).then( ret => {

			console.log(ret)

			if( ret ) {
				// log the user in after purchase
				this.handleWpLogin( fields )
			}

		}).catch( e => {

			console.warn(e)
			this.presentToast('There was a problem with your purchase, please try again.')

		});

	}

	// send the data to WP
	// if the user doesn't exist, register them
	// log them in and add user meta of in_app_purchase = true
	handleWpLogin( userData ) {

		this.showSpinner()

		this.presentToast('Purchase successful! Logging you in...')

		this.wplogin.iapRegisterLogIn( userData ).then( data => {

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

		alert("Success! Please use the app menu to access your content.")

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