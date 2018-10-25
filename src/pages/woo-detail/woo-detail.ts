import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, ModalController, Events } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import { Storage } from '@ionic/storage';
import { WooProvider } from '../../providers/woo/woo';

@IonicPage()
@Component({
  selector: 'page-woo-detail',
  templateUrl: 'woo-detail.html',
})
export class WooDetail {

	selectedItem: any;
	description: any;
	cartModal: any;
	variations: any;
	cart_count: number;
	itemAdded: boolean = false;
	groupedProducts: Array<any>;

	constructor(
		public navCtrl: NavController, 
		public navParams: NavParams,
		public sanitizer: DomSanitizer,
		public storage: Storage,
		public toastCtrl: ToastController,
		public modalCtrl: ModalController,
		public wooProvider: WooProvider,
		public events: Events
		) {

		if( !this.navParams.get('item') )
			return;

		this.loadProduct()

		this.wooProvider.getCartContents().then( cart => {
			this.cart_count = ( cart && typeof cart != 'string' && (<any>cart).products ? (<any>cart).products.length : '' )
		})

		events.subscribe('clear_cart', data => {
	      this.cart_count = 0
	    });

	}

	loadProduct() {

		this.selectedItem = this.navParams.get('item');

		if( this.selectedItem.description ) {
		  this.description = this.sanitizer.bypassSecurityTrustHtml( this.selectedItem.description );
		} else {
			this.description = '';
		}

		this.getVariations()

		if( this.selectedItem.grouped_products && this.selectedItem.grouped_products.length ) {
			this.getGroupedProducts()
		}

		if( !this.selectedItem.quantity ) {
			this.selectedItem.quantity = 1
		}

	}

	increment( item ) {
		item.quantity = parseInt( item.quantity ) + 1
	}

	decrement( item ) {
		item.quantity = parseInt( item.quantity ) - 1
	}

	addToCart(form) {

		let item = form.value

		if( this.selectedItem.type === 'grouped' ) {
			this.addGroupedItem( item )
		} else {
			this.addSingleItem( item )
		}

		this.instantAdd( item )

	}

	// we show success right away to enhance perceived speed
	// only if there is an error we alert the user
	instantAdd( item ) {

		this.cart_count++
		// flash cart icon
		this.itemAdded = true
		setTimeout( () => {
			this.itemAdded = false
		}, 1000 );

		this.presentToast( 'Adding ' + item.name + ' to cart.' )

	}

	addSingleItem( item ) {

		item.name = this.selectedItem.name
		item.product_id = this.selectedItem.id
		item.price = this.selectedItem.price
		item.quantity = this.selectedItem.quantity

		this.wooProvider.addToCart( item ).then( data => {
			
			this.productAddSuccess( data, item )

		}).catch( e => { 

			this.productAddError( e )
			console.warn(e)

		} )

	}

	addGroupedItem( item ) {

		var that = this;

		// using async/await with promise inside loop
		(async function loop() {
		    for ( var id in item ) {
		        await that.addGroupItemToCart( id, item[id] );
		    }
		})();

	}

	addGroupItemToCart( id, quantity ) {

		return new Promise( (resolve, reject) => {

			var item:any = {}

			item.product_id = id

			let productObject:any = this.groupedProducts.filter(obj => {
				if( obj.id === parseInt( id ) ) {
					return obj
				}
			})

			// console.log(productObject[0])
			item.name = ( productObject[0] ? productObject[0].name : '' )
			item.product_id = id
			item.price = ( productObject[0] ? productObject[0].price : '' )
			item.quantity = ( quantity ? quantity : 1 )

			this.wooProvider.addToCart( item ).then( data => {
				this.productAddSuccess( data, item )
			}).catch( e => { 
				console.warn(e)
				this.productAddError( e ) 
			}).then( () => resolve() )

		})

	}

	productAddSuccess( data, item ) {

		this.events.publish( 'add_to_cart', item )

	}

	productAddError( e ) {

		this.cart_count--

		let msg;

		if( e.error && e.error.message ) {
			msg = e.error.message
		} else {
			msg = 'There was a problem, your item was not added to the cart.'
		}

		this.presentToast( msg ) 

	}

	// grouped products just give us the IDs in the API response, so we need to go get each grouped product's details so we can add it to the cart with price, name, etc. Grouped products get added as individual products in the cart.
	getGroupedProducts() {

		this.groupedProducts = []

		for (var i = 0; i < this.selectedItem.grouped_products.length; ++i) {

			this.wooProvider.get( 'products/' + this.selectedItem.grouped_products[i], 'nopaging' ).then(product => {
				
				this.groupedProducts.push( product )

			}).catch( e => {
				console.warn(e)
			})

		}

	}

	getVariations() {

		this.wooProvider.get( 'products/' + this.selectedItem.id + '/variations', 'nopaging' ).then(variations => {
			console.log('variations', variations)
			this.variations = variations
		}).catch( e => {
			console.warn(e)
		})

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

	showCart() {

	    // this.cartModal = this.modalCtrl.create( 'CartPage' );
	    
	    // this.cartModal.present();

	    this.navCtrl.push('CartPage')

	}

}