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
import {MapPage} from '../pages/google-map/google-map';
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
//import {InnerContent} from '../directives/inner-content/inner-content';

@NgModule({
  declarations: [ // pages, custom components, pipes, etc
    MyApp,
    ListPage,
    PostList,
    Iframe,
    TabsPage,
    MapPage,
    CustomPage,
    SanitizeHtml,
    PostDetailsPage,
    ItemDetailsPage
    //InnerContent
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [ // pages go here
    MyApp,
    ListPage,
    PostList,
    Iframe,
    TabsPage,
    MapPage,
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
    AppData
  ]
})
export class AppModule {}
