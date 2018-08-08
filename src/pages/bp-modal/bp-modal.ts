import { Component } from '@angular/core';
import { Events, ViewController, LoadingController, IonicPage, ToastController, NavParams, ModalController } from 'ionic-angular';
import {Storage} from '@ionic/storage';
import {Device} from '@ionic-native/device';
import {TranslateService} from '@ngx-translate/core';
import {BpProvider} from '../../providers/buddypress/bp-provider';
import { ActionSheet, ActionSheetOptions } from '@ionic-native/action-sheet';

@IonicPage()
@Component({
  selector: 'bp-modal',
  templateUrl: 'bp-modal.html'
})
export class BpModal {

	spinner: any
	is_preview: boolean = false;
	title: string = '';
	login_data: any;
	activity: any = {};
	uploadedImage: string;
	route: any;
	isReply: boolean = false;

	constructor(
		public navParams: NavParams,
		public viewCtrl: ViewController,
		public loadingCtrl: LoadingController,
		public events: Events,
		public storage: Storage,
		public translate: TranslateService,
		private toastCtrl: ToastController,
		private Device: Device,
		public bpProvider: BpProvider,
		private actionSheet: ActionSheet,
		public modalCtrl: ModalController
		) {
      
		if(this.navParams.get('title')) {
			this.title = this.navParams.get('title');
		} else {
			this.title = 'Activity';
		}

		this.route = this.navParams.get('route');

		console.log( 'comment ' + this.navParams.get('comment') );

		if( this.navParams.get('comment') == true ) {
			this.isReply = true;
		}

		// get login data on first load
		this.storage.get('user_login').then( data => {

			if(data) {
			  this.login_data = data
			}

		});

		this.is_preview = (location.href.indexOf('myapppresser') > 0);

	}

	submitForm() {

		if( !this.activity && !this.uploadedImage ) {
			this.presentToast("Please enter some content.")
			return;
		}

		console.log(this.activity)

		if( this.uploadedImage ) {

			this.bpProvider.postWithImage( this.login_data, this.activity, this.uploadedImage )

				.then( ret => {

					console.log(ret)
					this.presentToast('Update posted!')
					this.events.publish('bp-list-reload')
					setTimeout( ()=> {
						this.dismiss()
					}, 500 )

				}).catch( e => {

					console.warn(e)
					this.presentToast('There was a problem, please try again.')

				});

		} else {

			if( this.isReply ) {
				this.activity.parent = this.navParams.get('parent');
			}

			this.bpProvider.postTextOnly( this.login_data, this.activity )

				.then( ret => {

					console.log(ret)

					if( this.isReply ) {
						this.presentToast('Comment posted!')
						this.events.publish('bp-add-comment', ret )
					} else {
						this.presentToast('Update posted!')
						this.events.publish('bp-add-activity', ret )
					}

					setTimeout( ()=> {
						this.dismiss()
					}, 500 )
					

				}).catch( e => {

					console.warn(e)
					this.presentToast('There was a problem, please try again.')

				});

		}

	}

	openLoginModal() {
		this.modalCtrl.create('LoginModal')
	}

	imageSheet() {

		let options = {
	      title: 'Choose an image',
	      buttonLabels: ['Take Photo', 'Photo Library'],
	      addCancelButtonWithLabel: 'Cancel',
	      destructiveButtonLast: true
	    }
    
	    this.actionSheet.show( options ).then( (buttonIndex: number) => {

	      if( buttonIndex === 1 ) {

	        this.bpProvider.doCamera( 'camera' ).then( image => {

	        	this.uploadedImage = (<string>image)
	        })

	      } else if( buttonIndex === 2 ) {

	        this.bpProvider.doCamera( 'library' ).then( image => {
	        	console.log(image) 
	        	this.uploadedImage = (<string>image)
	        })

	      }

	    })

	}

	dismiss() {
		this.viewCtrl.dismiss();
	}

	showSpinner() {
		this.spinner = this.loadingCtrl.create();

		this.spinner.present();
	}

	hideSpinner() {
		this.spinner.dismiss();
	}

	presentToast(msg) {

	    let toast = this.toastCtrl.create({
	      message: msg,
	      duration: 5000,
	      position: 'bottom'
	    });

	    toast.present();

	}

}