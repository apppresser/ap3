import { NgModule, ErrorHandler } from '@angular/core';
import {Http} from '@angular/http';
import { HttpModule } from '@angular/http';
import { IonicApp, IonicModule, IonicErrorHandler, IonicPageModule } from 'ionic-angular';
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

/* Pages */
import {TabsPage} from '../pages/tabs/tabs';
import {MediaPlayer} from '../pages/media-player/media-player';
import {LoginModal} from '../pages/login-modal/login-modal';
import {PushSettings} from '../pages/push-settings/push-settings';
import {LanguageSettings} from '../pages/language-settings/language-settings';

/* Providers */
import {AppCamera} from '../providers/camera/app-camera';
import {Posts} from '../providers/posts/posts';
import {GlobalVars} from '../providers/globalvars/globalvars';
import {AppAds} from '../providers/appads/appads';
import {FbConnect} from '../providers/facebook/facebook';
import {PushService} from '../providers/push/push';
import {AppWoo} from '../providers/appwoo/appwoo';
import {AppData} from '../providers/appdata/appdata';
import {WPlogin} from '../providers/wplogin/wplogin';
import {HeaderLogo} from '../providers/header-logo/header-logo';
import {VideoUtils} from "../providers/video/video-utils";

/* Other */
import {SanitizeHtml} from '../pipes/sanitize-html';
// import {SanitizeHtmlModule} from '../pipes/sanitize-html.module';
import {DynamicComponentModule} from 'angular2-dynamic-component/index';
import { IonicStorageModule } from '@ionic/storage';

/* Videogular */
import {BrowserModule} from '@angular/platform-browser';
import {VgCoreModule} from 'videogular2/core';
import {VgControlsModule} from 'videogular2/controls';
import {VgOverlayPlayModule} from 'videogular2/overlay-play';
import {VgBufferingModule} from 'videogular2/buffering';

// required for ng translate, tells it to look in assets folder for trans files
export function createTranslateLoader(http: Http) {
    return new TranslateHttpLoader(http, 'assets/i18n', '.json');
}
 
export class MyMissingTranslationHandler implements MissingTranslationHandler {
    handle(params: MissingTranslationHandlerParams) {
        return params.key;
    }
}

@NgModule({
  declarations: [ // pages, custom components, pipes, etc
    MyApp,
    TabsPage,
    SanitizeHtml,
    MediaPlayer,
    LoginModal,
    PushSettings,
    LanguageSettings
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    // SanitizeHtmlModule.forRoot(),
    DynamicComponentModule,
    BrowserModule,
    HttpModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
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
    MyApp,
    TabsPage,
    MediaPlayer,
    LoginModal,
    PushSettings,
    LanguageSettings
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    {provide: MissingTranslationHandler, useClass: MyMissingTranslationHandler},
    AppCamera,
    Posts,
    GlobalVars,
    AppAds,
    FbConnect,
    PushService,
    AppWoo,
    AppData,
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
    SanitizeHtml,
    Geolocation,
    VideoUtils
  ]
})
export class AppModule {}
