import {BrowserModule} from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import {Http} from '@angular/http';
import { HttpModule } from '@angular/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { TranslateModule, TranslateLoader, MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateStore } from "@ngx-translate/core/src/translate.store";
import { ActionSheet } from "@ionic-native/action-sheet";
import { Camera } from "@ionic-native/camera";
import { Device } from "@ionic-native/device";
import { Transfer } from "@ionic-native/transfer";
import { File } from "@ionic-native/file";
import { AdMob } from "@ionic-native/admob";
import { Facebook } from "@ionic-native/facebook";
import { InAppBrowser } from "@ionic-native/in-app-browser";
import { Keyboard } from "@ionic-native/keyboard";
import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";
import { Network } from "@ionic-native/network";
import { SocialSharing } from "@ionic-native/social-sharing";
import { Push } from "@ionic-native/push";
import { Dialogs } from "@ionic-native/dialogs";
import { Geolocation } from "@ionic-native/geolocation";
import { InAppPurchase } from '@ionic-native/in-app-purchase';

/* Providers */
import {AppCamera} from '../providers/camera/app-camera';
import {Posts} from '../providers/posts/posts';
import {GlobalVars} from '../providers/globalvars/globalvars';
import {AppAds} from '../providers/appads/appads';
import {Logins} from "../providers/logins/logins";
import {FbConnectIframe} from '../providers/facebook/login-iframe';
import {FbConnectApp} from '../providers/facebook/login-app';
import {FBConnectAppSettings} from '../providers/facebook/fbconnect-settings';
import {PushService} from '../providers/push/push';
import {AppWoo} from '../providers/appwoo/appwoo';
import {AppData} from '../providers/appdata/appdata';
import {WPlogin} from '../providers/wplogin/wplogin';
import { LoginService } from "../providers/logins/login.service";
import {HeaderLogo} from '../providers/header-logo/header-logo';
import {VideoUtils} from "../providers/video/video-utils";
import {AppGeo} from "../providers/appgeo/appgeo";
import {IAP} from "../providers/inapppurchase/inapppurchase";
import { VideoItemService } from "../pages/video-playlist/video-item.service";

/* Components */
import { FooterNavComponent } from "../providers/footer-nav/footer-nav.component";

/* Other */
import { IonicStorageModule } from '@ionic/storage';

// required for ng translate, tells it to look in assets folder for trans files
export function createTranslateLoader(http: Http) {
    return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}
 
export class MyMissingTranslationHandler implements MissingTranslationHandler {
    handle(params: MissingTranslationHandlerParams) {
        return params.key;
    }
}

@NgModule({
  declarations: [ // pages, custom components, pipes, etc
    MyApp,
    FooterNavComponent
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    BrowserModule,
    HttpModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [Http]
      }
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [ // pages go here
    MyApp
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    {provide: MissingTranslationHandler, useClass: MyMissingTranslationHandler},
    AppCamera,
    Posts,
    GlobalVars,
    AppAds,
    FbConnectIframe,
    FbConnectApp,
    FBConnectAppSettings,
    PushService,
    AppWoo,
    AppData,
    AppGeo,
    LoginService,
    VideoItemService,
    Logins,
    WPlogin,
    HeaderLogo,
    ActionSheet,
    Camera,
    Device,
    Transfer,
    File,
    AdMob,
    Facebook,
    InAppBrowser,
    Keyboard,
    SplashScreen,
    StatusBar,
    Network,
    SocialSharing,
    Push,
    Dialogs,
    Geolocation,
    VideoUtils,
    IAP,
    InAppPurchase
  ]
})
export class AppModule {}
