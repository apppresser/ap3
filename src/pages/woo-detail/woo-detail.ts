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
	reviews: any;
	cart_count: number;
	itemAdded: boolean = false;
	groupedProducts: Array<any>;
	productLoaded: boolean = false;
	availableAttributes: any;

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

		events.subscribe( 'clear_cart', data => {
	      this.cart_count = 0
	      console.log('detail clear cart ' + this.cart_count )
	    });

	    events.subscribe('cart_change', data => {
	      this.getCartFromAPI()
	    });

	    // make sure cart count is always updated on initial load
	    this.getCartFromAPI()

	}

	ionViewWillEnter() {

		this.getCartCount()

	}

	getCartCount() {

		this.storage.get( 'cart_count' ).then( data => {
			if( data ) {
				this.cart_count = data
			}
		})
	}

	getCartFromAPI() {

		this.wooProvider.getCartContents().then( cart => {
			this.cart_count = ( cart && typeof cart != 'string' && (<any>cart).cart_total ? (<any>cart).cart_total.cart_contents_count : '' )
			// don't need to save count to storage, it's already saved in woo.ts
		})

	}

	loadProduct() {

		this.selectedItem = this.navParams.get('item');

		console.log(this.selectedItem)

		if( this.selectedItem.description ) {
		  this.description = this.sanitizer.bypassSecurityTrustHtml( this.selectedItem.description );
		} else {
			this.description = '';
		}

		this.availableAttributes = this.selectedItem.attributes

		if( this.selectedItem.type === 'variable' ) {
			this.getVariations()
		} else if( this.selectedItem.type === 'grouped' ) {
			this.getGroupedProducts()
		} else {
			this.productLoaded = true
		}

		setTimeout( () => {
			this.getProductReviews()
		}, 1500 )

		if( !this.selectedItem.quantity ) {
			this.selectedItem.quantity = 1
		}

	}

	variationChanged( e, attribute ) {

		console.log(e, attribute)

		if( !this.variations )
			return;

		// check what other attributes are possible with attribute.name == e, and send those to availableAttributes
		for (let i = 0; i < this.variations.length; ++i) {
			console.log( attribute.name + '=' + e)
			if( this.variations[i].attributes.length ) {
				console.log(this.variations[i].attributes)
			}
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

		if( item.quantity === 0 ) {
			this.presentToast( 'Please select a quantity.' )
			return;
		}

		if( this.selectedItem.type === 'grouped' ) {
			this.addGroupedItem( item )
			this.instantAdd( item, true )
		} else if( this.selectedItem.type === 'external' ) {
			window.open( this.selectedItem.external_url, '_blank' )
			return;
		} else {
			this.addSingleItem( item )
			this.instantAdd( item, false )
		}

	}

	// we show success right away to enhance perceived speed
	// only if there is an error we alert the user
	instantAdd( item, grouped ) {

		this.cart_count = ( this.cart_count ? this.cart_count : 0 )

		if( grouped ) {

			for( let product of this.groupedProducts ) {
				this.cart_count = this.cart_count + parseInt( product.quantity )
			}

		} else {
			this.cart_count = this.cart_count + parseInt( item.quantity )
		}

		this.storage.set( 'cart_count', this.cart_count )
		
		// flash cart icon
		this.itemAdded = true
		setTimeout( () => {
			this.itemAdded = false
		}, 1000 );

	}

	addSingleItem( item ) {

		console.log(item, this.selectedItem)

		// if( this.variations.length ) {
		// 	item.variation_id = this.getVariationId( item )
		// }

		this.presentToast( 'Adding ' + this.selectedItem.name + ' to cart...' )

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

	getVariationId( item ) {

		// match attributes with a variation ID
	}

	addGroupedItem( item ) {

		this.presentToast( 'Adding ' + this.selectedItem.name + ' to cart.' )

		var that = this;

		// using async/await with promise inside loop
		(async function loop() {
		    for ( var id in item ) {
		        await that.addGroupItemToCart( id, item.quantity );
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
			item.quantity = ( productObject[0] ? productObject[0].quantity : 1 )

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

		this.storage.set( 'cart_count', this.cart_count )

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

				if( !(<any>product).quantity ) {
					(<any>product).quantity = 1
				}
				
				this.groupedProducts.push( product )

				this.productLoaded = true

			}).catch( e => {
				console.warn(e)
			})

		}

	}

	getVariations( arg = null ) {

		let param = ( arg ? '/?' + arg : '' )

		this.wooProvider.get( 'products/' + this.selectedItem.id + '/variations' + param, 'nopaging' ).then(variations => {
			console.log('variations', variations)
			this.variations = variations
		}).catch( e => {
			console.warn(e)
		}).then( () => { 
			this.productLoaded = true 
		})

	}

	getProductReviews() {

		this.wooProvider.get( 'products/reviews/?product=' + this.selectedItem.id, 'nopaging' ).then(reviews => {
			console.log('reviews', reviews)
			this.reviews = reviews
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