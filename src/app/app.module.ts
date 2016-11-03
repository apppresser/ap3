import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
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
    ItemDetailsPage
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    DynamicComponentModule
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
    ItemDetailsPage
  ],
  providers: [
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
