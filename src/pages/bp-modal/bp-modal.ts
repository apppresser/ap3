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
	isMessage: boolean = false;
	groupId: any = null;
	recipients: any;
	recipientArr: any[]

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

		if( this.navParams.get('comment') == true ) {
			this.isReply = true;
		}

		if( this.navParams.get('message') == true ) {
			this.isMessage = true;
		}

		if( this.navParams.get('recipients') ) {
			this.recipients = this.navParams.get('recipients');
		}

		if( this.navParams.get('group') ) {
			this.groupId = this.navParams.get('group')
		}

		// get login data on first load
		this.storage.get('user_login').then( data => {

			if(data) {

				this.login_data = data
			

				if( this.isMessage && !this.recipients ) {
					this.populateRecipients()
				}

			}

		});

		this.is_preview = (location.href.indexOf('myapppresser') > 0);

	}

	populateRecipients() {

		let item = window.localStorage.getItem( 'myappp' );
		let wp_url = JSON.parse( item ).wordpress_url;
		let rest_base = 'wp-json/ap-bp/v1/members';
		let route = wp_url + rest_base

		this.bpProvider.getItems( route + '?scope=friends&user=' + this.login_data.user_id, this.login_data, 1 ).then( items => {

				console.log(items)
				this.recipientArr = (<any>items);

		  }).catch( e => {
		  	console.warn(e)
		  })

	}

	recipientSelected() {
		console.log( this.recipients )
	}

	submitForm() {

		if( !this.activity && !this.uploadedImage ) {
			this.presentToast("Please enter some content.")
			return;
		}

		this.showSpinner()

		if( this.uploadedImage ) {

			this.bpProvider.postWithImage( this.login_data, this.activity, this.uploadedImage, this.groupId )

				.then( ret => {

					console.log(ret)

					this.presentToast('Update posted!')
					this.events.publish('bp-add-activity', ret )
					setTimeout( ()=> {
						this.dismiss()
					}, 500 )

					this.hideSpinner()

				}).catch( e => {

					console.warn(e)
					this.presentToast('There was a problem, please try again.')
					this.hideSpinner()

				});

		} else if( this.isMessage ) {

			if( !this.activity.content ) {
				this.presentToast('Please enter some content.')
				return;
			}

			let threadId = ( this.navParams.data.threadId ? this.navParams.data.threadId : null )

			this.bpProvider.sendMessage( this.recipients, this.login_data, this.activity.subject, this.activity.content, threadId ).then( ret => {

				console.log(ret)
				if( ret ) {
					this.presentToast( "Message sent." )
					this.events.publish('bp-add-message', { subject: this.activity.subject, content: this.activity.content, threadId: ret } )
				}

				this.dismiss(ret)
				
				this.hideSpinner()

			}).catch( e => {

				console.warn(e)
				this.presentToast('There was a problem, please try again.')
				this.hideSpinner()

			});

		} else {

			if( this.isReply ) {

				this.activity.parent = this.navParams.get('parent');

				if( !this.activity.content ) {
					this.presentToast('Please enter some content.')
					return;
				}

			}

			this.bpProvider.postTextOnly( this.login_data, this.activity, this.groupId )

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
					}, 100 )

					this.hideSpinner()
					

				}).catch( e => {

					console.warn(e)
					this.presentToast('There was a problem, please try again.')
					this.hideSpinner()

				});

		}

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

	dismiss( data = null ) {
		this.viewCtrl.dismiss( data );
	}

	showSpinner() {
		this.spinner = this.loadingCtrl.create({
	        showBackdrop: false
	    });

		this.spinner.present( this.spinner );
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