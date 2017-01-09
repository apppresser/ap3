import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

/* Pages */
import {ListPage} from '../pages/list/list';
import {ItemDetailsPage} from '../pages/item-details/item-details';
import {PostList} from '../pages/post-list/post-list';
import {PostDetailsPage} from '../pages/post-details/post-details';
import {Iframe} from '../pages/iframe/iframe';
import {TabsPage} from '../pages/tabs/tabs';
// import {MapPage} from '../pages/google-map/google-map';
import {CustomPage} from '../pages/custom-pages/custom-page';
import {MediaPlayer} from '../pages/media-player/media-player';

/* Providers */
import {AppCamera} from '../providers/camera/app-camera';
import {Posts} from '../providers/posts/posts';
import {GlobalVars} from '../providers/globalvars/globalvars';
import {AppAds} from '../providers/appads/appads';
import {FbConnect} from '../providers/facebook/facebook';
import {PushService} from '../providers/push/push';
import {AppWoo} from '../providers/appwoo/appwoo';
import {AppData} from '../providers/appdata/appdata';

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

@NgModule({
  declarations: [ // pages, custom components, pipes, etc
    MyApp,
    ListPage,
    PostList,
    Iframe,
    TabsPage,
    CustomPage,
    SanitizeHtml,
    PostDetailsPage,
    ItemDetailsPage,
    MediaPlayer
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    DynamicComponentModule,
    BrowserModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [ // pages go here
    MyApp,
    ListPage,
    PostList,
    Iframe,
    TabsPage,
    CustomPage,
    PostDetailsPage,
    ItemDetailsPage,
    MediaPlayer
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AppCamera,
    Posts,
    GlobalVars,
    AppAds,
    FbConnect,
    PushService,
    AppWoo,
    AppData,
    Storage
  ]
})
export class AppModule {}
