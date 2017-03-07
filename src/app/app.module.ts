import { NgModule, ErrorHandler } from '@angular/core';
import {Http} from '@angular/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { TranslateModule, TranslateStaticLoader, TranslateLoader, MissingTranslationHandler, MissingTranslationHandlerParams } from 'ng2-translate/ng2-translate';

/* Pages */
import {PostList} from '../pages/post-list/post-list';
import {PostDetailsPage} from '../pages/post-details/post-details';
import {Iframe} from '../pages/iframe/iframe';
import {TabsPage} from '../pages/tabs/tabs';
import {CustomPage} from '../pages/custom-pages/custom-page';
import {MediaPlayer} from '../pages/media-player/media-player';
import {LoginModal} from '../pages/login-modal/login-modal';

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

/* Other */
import {SanitizeHtml} from '../pipes/sanitize-html';
import {DynamicComponentModule} from 'angular2-dynamic-component/index';
import {Storage} from '@ionic/storage';

/* Videogular */
import {BrowserModule} from '@angular/platform-browser';
import {VgCoreModule} from 'videogular2/core';
import {VgControlsModule} from 'videogular2/controls';
import {VgOverlayPlayModule} from 'videogular2/overlay-play';
import {VgBufferingModule} from 'videogular2/buffering';

// required for ng translate, tells it to look in assets folder for trans files
export function createTranslateLoader(http: Http) {
    return new TranslateStaticLoader(http, 'assets/i18n', '.json');
}
 
export class MyMissingTranslationHandler implements MissingTranslationHandler {
    handle(params: MissingTranslationHandlerParams) {
        return params.key;
    }
}

@NgModule({
  declarations: [ // pages, custom components, pipes, etc
    MyApp,
    PostList,
    Iframe,
    TabsPage,
    CustomPage,
    SanitizeHtml,
    PostDetailsPage,
    MediaPlayer,
    LoginModal
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    DynamicComponentModule,
    BrowserModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (createTranslateLoader),
      deps: [Http]
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [ // pages go here
    MyApp,
    PostList,
    Iframe,
    TabsPage,
    CustomPage,
    PostDetailsPage,
    MediaPlayer,
    LoginModal
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
    Storage,
    WPlogin
  ]
})
export class AppModule {}
