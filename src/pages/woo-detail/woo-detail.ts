import {Component, Renderer, ElementRef, isDevMode, ComponentFactoryResolver, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, ModalController, Events } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import { Storage } from '@ionic/storage';
import { WooProvider } from '../../providers/woo/woo';
import {SocialSharing} from '@ionic-native/social-sharing';
import {TranslateService} from '@ngx-translate/core';
import {InAppBrowser, InAppBrowserObject} from '@ionic-native/in-app-browser';
import { MyApppSettingsService } from '../../providers/appdata/myappp.settings.service';

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
	filteredVariations: any;
	noResults: boolean = false;
	reviews: any;
	moreReviewsExist: boolean = false;
	cart_count: number;
	itemAdded: boolean = false;
	groupedProducts: Array<any>;
	productLoaded: boolean = false;
	availableAttributes: any;
	listenFunc: Function;
	currencySymbol: any;
	productImages: any;
	@ViewChild('addToCartForm') addToCartForm;

	constructor(
		public navCtrl: NavController, 
		public navParams: NavParams,
		public sanitizer: DomSanitizer,
		public storage: Storage,
		public toastCtrl: ToastController,
		public modalCtrl: ModalController,
		public wooProvider: WooProvider,
		public events: Events,
		private elementRef: ElementRef,
		private renderer: Renderer,
		private myapppsettings: MyApppSettingsService,
		public socialSharing: SocialSharing,
		public translate: TranslateService,
		public inAppBrowser: InAppBrowser
		) {

		if( !this.navParams.get('item') )
			return;

		this.loadProduct()

	    events.subscribe('cart_change', count => {
	      this.cart_count = (<number>count)
	    });

	    // make sure cart count is always updated on initial load
	    this.getCartFromAPI()

	}

	ionViewWillEnter() {

		this.getCartCount()

	}

	ionViewWillLeave() {
		this.resetOptions()
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
			this.cart_count = ( cart && typeof cart != 'string' && (<any>cart).cart_total ? (<any>cart).cart_total.cart_contents_count : 0 )
			// don't need to save count to storage, it's already saved in woo.ts
		}).catch( e => {
			console.warn(e)
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

		if( this.selectedItem.images.length ) {
			this.productImages = this.selectedItem.images
		}

		this.wooProvider.getCurrencySymbol().then( symbol => {
	    	this.currencySymbol = symbol
	    })

		this.listener()

	}

	// remove attributes that are used for variations
	getAvailableAttributes() {

		this.availableAttributes = this.selectedItem.attributes.filter( attribute =>  {
				if( attribute.variation ) {
					return attribute;
				}
			})

	}

	attributeChanged( value, attribute ) {

		// bail on form reset
		if( !value.length ) {
			return;
		}

		// get rid of all dashes, fixes a bug
		value = value.replace(/-/g, " ")

		this.noResults = false
		// find variations with this attribute in them, and filter

		let getVariations = this.filteredVariations.filter( variation => {

			for (let i = 0; i < variation.attributes.length; ++i) {

				// fix bugs with special characters
				let decoded = decodeURIComponent( variation.attributes[i].option )
				decoded = decoded.replace(/-/g, " ")

				if( variation.attributes[i].name === attribute.name && decoded === value ) {
					return variation;
				}
			}
		})

		// if there are no results, we don't want to wipe the array, just display a notice
		if( !getVariations.length ) {
			this.noResults = true
			attribute.highlight = true
		} else {
			attribute.disabled = true
			this.filteredVariations = getVariations
			attribute.highlight = false
		}

		if( this.filteredVariations.length === 1 ) {
			this.productImages = [ this.filteredVariations[0].image ]
		}
	}

	resetOptions() {

		if(!this.selectedItem || !this.availableAttributes )
			return;

		this.filteredVariations = this.variations

		for (let i = 0; i < this.availableAttributes.length; ++i) {

			this.availableAttributes[i].disabled = false
			this.availableAttributes[i].highlight = false
		}

		this.productImages = this.selectedItem.images

		this.noResults = false

		this.addToCartForm.reset();
	}

	increment( item ) {
		item.quantity = parseInt( item.quantity ) + 1
	}

  /**
   * Decrease quantity by one only if bigger than 1
   * @param {*} item
   */
  public decrement(item: any): void {
    let quantity: number = parseInt(item.quantity);
    if (quantity > 1) {
      item.quantity = quantity - 1;
    }
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
		} else if( this.selectedItem.type === 'composite' ) {
			return;
		} else {
			this.addSingleItem( item )
			this.instantAdd( item, false )
		}

	}

	// we show success right away to enhance perceived speed
	// only if there is an error we alert the user
	instantAdd( item, grouped ) {
		
		// flash cart icon
		this.itemAdded = true
		setTimeout( () => {
			this.itemAdded = false
		}, 1000 );

	}

	addSingleItem( item ) {

		if( this.variations && this.variations.length ) {

			// don't allow adding to cart if attributes are not all selected
			for (let i = 0; i < this.availableAttributes.length; ++i) {

				// if attributes are not all selected, you can still add item to cart if there is one variation we narrowed it down to. Otherwise you can't add to cart.
				if( !this.availableAttributes[i].disabled && this.filteredVariations.length > 1 ) {
					this.translate.get( 'Please choose available options first.' ).subscribe( text => {
						this.presentToast( text )
					})
					
					return;
				}
			}

			// this handles duplicate variations
			if( this.filteredVariations && this.filteredVariations.length >= 1 ) {
				item.variation_id = this.filteredVariations[0].id
			}
			
			if( item.variation_id === undefined ) {
				this.translate.get( 'Not available, please select different options.' ).subscribe( text => {
					this.presentToast( text )
				})
				
				return;
			}
		}

		this.translate.get( 'added to cart' ).subscribe( text => {
			this.presentToast( this.selectedItem.name + ' ' + text )
		})

		item.name = this.selectedItem.name
		item.product_id = this.selectedItem.id
		item.price = this.selectedItem.price
		item.quantity = this.selectedItem.quantity

		this.wooProvider.addToCart( item ).then( data => {
			
			this.productAddSuccess( item )

		} ).catch( e => {
			this.productAddError( e )
			console.warn(e)
		})

	}

	addToList() {

		this.storage.get('woo_saved_items').then( items => {

			if( !items ) {
				items = [ this.selectedItem ]
			} else {

				var inArray = false;

			    for (let i = items.length - 1; i >= 0; i--) {

			      if( items[i].id === this.selectedItem.id ) {
			        inArray = true;
			        break;
			      }

			    }

			    // Don't add duplicate favs
			    if( inArray === false ) {
			    	items.push( this.selectedItem )
			    }

			}

			this.storage.set( 'woo_saved_items', items )
		})

		this.presentToast( this.selectedItem.name + ' added to list.')

	}

	addGroupedItem( item ) {

		console.log(item, item.quantity)

		this.presentToast( this.selectedItem.name + ' added to cart.' )

		var that = this;

		// using async/await with promise inside loop
		(async function loop() {
		    for ( var id in item ) {
		        await that.addGroupItemToCart( id, item );
		    }
		})();

	}

	addGroupItemToCart( id, formValues ) {

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

			
			// add variation id if this is a variable product
			if( formValues[id + '_variation_id'] ) {
				item.variation_id = formValues[id + '_variation_id']
			}

			// hacky fix because of the way our object is
			if( item.product_id.indexOf('variation_id') >= 0 ) {
				return;
			}

			console.log('item before add to cart', item)

			this.wooProvider.addToCart( item ).then( data => {
				this.productAddSuccess( item )
			}).catch( e => { 
				console.warn(e)
				this.productAddError( e ) 
			}).then( () => resolve() )

		})

	}

	productAddSuccess( item ) {

		let quantity = ( item.quantity ? item.quantity : 1 )

		this.cart_count = this.cart_count + quantity
		this.storage.set( 'cart_count', this.cart_count )
		this.events.publish( 'cart_change', this.cart_count )

		// maybe reset options
		if( this.availableAttributes ) {
			for (let i = 0; i < this.availableAttributes.length; ++i) {

				this.availableAttributes[i].disabled = false
				this.availableAttributes[i].highlight = false
			}

			this.filteredVariations = this.variations
		}

	}

	productAddError( e ) {

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

				// if we have a variable product as part of the groupe, we have to get all the options and display those for the user to choose from
				if( (<any>product).type === 'variable' ) {

					this.productLoaded = false

					this.getGroupedVariation((<any>product).id).then( variations => {
						(<any>product).groupVariations = variations
						this.groupedProducts.push( product )
						this.productLoaded = true
						console.log('grouped', this.groupedProducts)
					})
					
				} else {

					this.groupedProducts.push( product )

					this.productLoaded = true
				}
				

			}).catch( e => {
				console.warn(e)
			})

		}

	}

	getGroupedVariation( productId ) {

		return new Promise( resolve => {

			this.wooProvider.get( 'products/' + productId + '/variations', 'nopaging' ).then(variations => {
				console.log('getGroupedVariation variations', variations)
				resolve( variations )

			}).catch( e => {
				console.warn(e)
				resolve( [] )
			})

		})

		

	}

	verifyVariations() {

		if(this.selectedItem.type == 'variable') {
			let can_purchase = true;

			if(this.variations && this.variations.length) {

				this.variations.forEach((variation, index) => {
					// console.log('verifyVariations variation', variation);
					if(this.myapppsettings.isPreview() && can_purchase && variation.price === '' && variation.purchasable === false) {
						can_purchase = false;
						console.warn('This variation can not be purchased, because no price has been set', variation);
						alert('Admin Notice: You have a variation that has no price and cannot be purchased. You can view the JavaScript console to see which one.');
					}
				});
			}
		}
	}

	getVariations( arg = null ) {

		let param = ( arg ? '/?' + arg : '' )

		this.wooProvider.get( 'products/' + this.selectedItem.id + '/variations' + param, 'nopaging' ).then(variations => {
			//console.log('getVariations variations', variations)
			this.variations = variations
			this.filteredVariations = variations
			this.getAvailableAttributes()
			this.verifyVariations()
			
		}).catch( e => {
			console.warn(e)
		}).then( () => { 
			this.productLoaded = true 
		})

	}

	getProductReviews() {

		this.wooProvider.get( 'products/reviews/?product=' + this.selectedItem.id + '&per_page=5', 1 ).then(reviews => {
			console.log('reviews', reviews)
			this.reviews = reviews

			if( this.reviews && this.reviews.length >= 5 ) {
				this.moreReviewsExist = true;
			}

		}).catch( e => {
			console.warn(e)
		})

	}

	moreReviews() {

		this.navCtrl.push('CommentsPage', { route: 'products/reviews/?product=' + this.selectedItem.id + '&per_page=20', title: this.selectedItem.name, woo: true } )

	}

	getRelatedRoute() {

		if( this.selectedItem.related_ids.length ) {
			return 'products?include=' + this.selectedItem.related_ids
		}

	}

	listener() {

		// remove listener first so we don't set it multiple times
	    if( this.listenFunc ) {
	      this.listenFunc()
	    }

	    // Listen for link clicks, open in in app browser
	    this.listenFunc = this.renderer.listen(this.elementRef.nativeElement, 'click', (event) => {

	      this.iabLinks( event.target )

	    });
	}

	iabLinks( el ) {

		console.log('iabLinks', el)

		var target = '_blank'
		  
		if( el.href && el.href.indexOf('http') >= 0 ) {

		  if( el.classList && el.classList.contains('system') )
		    target = '_system'

		  event.preventDefault()
		  this.iab( el.href, target )

		}

	}

	iab( url, target ) {

		if( !target ) {
			target = '_blank'
		}

		let browser = this.inAppBrowser.create( url + '?appcommerce=1', '_blank' )

		browser.on('exit').subscribe( data => {
          console.log('browser closed', data)

          // update cart in case items were changed on site
          this.getCartFromAPI()
        })
	}

	productSiteLink( url ) {

		this.translate.get('You are visiting our site to add this product. Return to the app after adding to your cart by pressing done on iOS or the X on Android.').subscribe( text => {
			alert( text )
			this.iab( url, '_blank' )
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

	    let cartPage = this.wooProvider.getWooPage('cart')

	    if( !cartPage ) {
	    	this.presentToast("No cart page set.")
	    	return;
	    }

	    let cartModule = this.getPageModuleName( cartPage.page_id )

	    this.navCtrl.push( cartModule, cartPage )

	}

	share() {

		this.socialSharing.share( this.selectedItem.name, null, null, this.selectedItem.permalink ).then(() => {
	      // Sharing via email is possible
	    }).catch(() => {
	      // Sharing via email is not possible
	    });

	}

	getPageModuleName(page_id) {
		if(!isDevMode())
			return 'Page'+page_id;
		else
			return 'CustomPage';
	}

	openImageModal( imageSrc ) {

	    const imageModal = this.modalCtrl.create('ImageModal', { src: imageSrc }, { cssClass: 'image-modal' } );
	    imageModal.present();

	  }

}