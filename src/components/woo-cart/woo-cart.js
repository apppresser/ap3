var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, Events, ToastController, LoadingController, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { WooProvider } from '../../providers/woo/woo';
import { InAppBrowser } from '@ionic-native/in-app-browser';
var WooCartComponent = /** @class */ (function () {
    function WooCartComponent(navCtrl, navParams, storage, viewCtrl, events, wooProvider, toastCtrl, loadingCtrl, platform, iab) {
        var _this = this;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.storage = storage;
        this.viewCtrl = viewCtrl;
        this.events = events;
        this.wooProvider = wooProvider;
        this.toastCtrl = toastCtrl;
        this.loadingCtrl = loadingCtrl;
        this.platform = platform;
        this.iab = iab;
        events.subscribe('cart_change', function (count) {
            _this.cart_count = count;
        });
    }
    WooCartComponent.prototype.ngOnInit = function () {
        this.getCartContents();
    };
    WooCartComponent.prototype.getCartContents = function () {
        var _this = this;
        this.showSpinner();
        this.wooProvider.getCartContents().then(function (response) {
            if (typeof response === 'string') {
                _this.cartEmpty = response;
                _this.cart_total = null;
                _this.products = [];
            }
            else {
                _this.products = response.products;
                _this.cart_total = response.cart_total.cart_contents_total;
                _this.cart_count = response.cart_total.cart_contents_count;
            }
            // any time a cart item is changed we get here, so publish cart count event here
            _this.events.publish('cart_change', _this.cart_count);
            console.log(response);
        }).catch(function (e) {
            console.warn(e);
        }).then(function () {
            _this.hideSpinner();
        });
    };
    WooCartComponent.prototype.clearCart = function () {
        var _this = this;
        this.showSpinner();
        this.wooProvider.clearCart().then(function (response) {
            _this.hideSpinner();
            _this.products = [];
            _this.cart_total = 0;
            _this.storage.set('cart_count', 0);
            _this.events.publish('cart_change', 0);
            _this.cartEmpty = "Cart is empty.";
        }).catch(function (e) { return console.warn(e); });
    };
    WooCartComponent.prototype.removeItem = function (item) {
        var _this = this;
        // small delay otherwise it feels too jumpy
        setTimeout(function () {
            // we remove the item right away, before the API call. It gets added back if there is an error.
            for (var i = _this.products.length - 1; i >= 0; i--) {
                if (_this.products[i].product_id === item.product_id) {
                    _this.products.splice(i, 1);
                    break;
                }
            }
            _this.cart_total = "Calculating...";
            _this.presentToast("Item removed.");
        }, 200);
        this.wooProvider.removeItem(item).then(function (response) {
            // success
            console.log(response);
        }).catch(function (e) {
            _this.presentToast("Could not remove item.");
            console.warn(e);
        }).then(function () {
            // update totals
            _this.getCartContents();
        });
    };
    WooCartComponent.prototype.increment = function (item) {
        item.quantity = parseInt(item.quantity) + 1;
        this.quantityChanged(item);
    };
    WooCartComponent.prototype.decrement = function (item) {
        item.quantity = parseInt(item.quantity) - 1;
        if (item.quantity === 0) {
            this.removeItem(item);
        }
        else {
            this.quantityChanged(item);
        }
    };
    WooCartComponent.prototype.quantityChanged = function (item) {
        var _this = this;
        console.log(item);
        this.wooProvider.updateItem(item, item.quantity).then(function (response) {
            _this.presentToast(response);
            // update totals
            _this.getCartContents();
        }).catch(function (e) {
            _this.presentToast("Could not update item.");
            console.warn(e);
        });
    };
    WooCartComponent.prototype.openCheckout = function () {
        var item = window.localStorage.getItem('myappp');
        var url = JSON.parse(item).wordpress_url;
        this.createBrowser(url + 'checkout');
    };
    WooCartComponent.prototype.loadDetail = function (item) {
        var opt = {};
        if (this.platform.isRTL && this.platform.is('ios'))
            opt = { direction: 'back' };
        this.navCtrl.push('WooDetail', {
            item: item
        }, opt);
    };
    WooCartComponent.prototype.createBrowser = function (url) {
        var _this = this;
        if (!this.platform.is('ios') && !this.platform.is('android')) {
            alert('Redirecting, please try from a device for a better checkout experience.');
            window.open(url, '_blank');
            return;
        }
        this.browser = this.iab.create(url + '?appcommerce=1', '_blank', 'location=no,toolbarcolor=#ffffff,navigationbuttoncolor=#444444,closebuttoncolor=#444444');
        this.browserSubscription1 = this.browser.on('exit').subscribe(function (data) {
            console.log('browser closed', data);
            // update cart in case items were changed on site
            _this.getCartContents();
            _this.browserCleanup(data);
            // this.orderComplete()
        });
        this.browserSubscription2 = this.browser.on('loadstart').subscribe(function (event) {
            console.log('loadstart', event);
            _this.maybeCompleteCheckout(event);
        });
    };
    // get order ID from url (woocommerce)
    WooCartComponent.prototype.getOrderId = function (url) {
        var order_id = '';
        if (url.indexOf('order_id') >= 0) {
            // get order ID param
            if (url.indexOf('cmd=_cart') >= 0) {
                url = decodeURIComponent(url);
            }
            var url2 = new URL(url);
            order_id = (url2.searchParams.get("order_id") ? url2.searchParams.get("order_id") : null);
        }
        else if (url.indexOf('order-received') >= 0) {
            // get order ID from url
            // this regex might fail if there are numbers in the url
            order_id = /(\/[0-9]+\/)/g.exec(url)[0];
            order_id = order_id.replace(/\//g, "");
        }
        return order_id;
    };
    WooCartComponent.prototype.maybeCompleteCheckout = function (event) {
        if (event.url.indexOf('order-received') >= 0 && event.url.indexOf('paypal.com') === -1) {
            this.order_id = this.getOrderId(event.url);
            this.browser.close();
            this.browserCleanup(null);
            // send to order complete page
            this.orderComplete();
        }
    };
    WooCartComponent.prototype.orderComplete = function () {
        console.log('order complete');
        // TODO: if order is unsuccessful don't clear cart...
        this.clearCart();
        this.browserSubscription1.unsubscribe();
        this.browserSubscription2.unsubscribe();
        // get empty cart page out of history
        this.navCtrl.pop();
        // send to order complete page
        this.navCtrl.push('ThanksPage', { 'order_id': this.order_id });
    };
    WooCartComponent.prototype.browserCleanup = function (data) {
        console.log('browser closed', data);
        this.browserSubscription1.unsubscribe();
        this.browserSubscription2.unsubscribe();
        this.browser = null;
    };
    WooCartComponent.prototype.presentToast = function (msg) {
        var toast = this.toastCtrl.create({
            message: msg,
            duration: 3000,
            position: 'bottom',
            cssClass: 'normal-toast'
        });
        toast.present();
    };
    WooCartComponent.prototype.showSpinner = function () {
        // create only one spinner
        if (!this.loading) {
            this.loading = this.loadingCtrl.create({
                showBackdrop: false,
                dismissOnPageChange: false
            });
            this.loading.present();
        }
    };
    WooCartComponent.prototype.hideSpinner = function () {
        if (this.loading)
            this.loading.dismiss();
    };
    WooCartComponent = __decorate([
        Component({
            selector: 'woo-cart',
            templateUrl: 'woo-cart.html',
        }),
        __metadata("design:paramtypes", [NavController,
            NavParams,
            Storage,
            ViewController,
            Events,
            WooProvider,
            ToastController,
            LoadingController,
            Platform,
            InAppBrowser])
    ], WooCartComponent);
    return WooCartComponent;
}());
export { WooCartComponent };
//# sourceMappingURL=woo-cart.js.map