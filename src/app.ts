import {App, IonicApp, Events, Platform, NavController} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {TutorialPage} from './pages/tutorial';
import Iframe from './pages/iframe';
import {IMenu, default as MenuService} from './providers/menu';


@App({
    template: require('./app.html'),
    providers: [MenuService],
    config: {},
    prodMode: __DEV__ ? false : true
})
class ConferenceApp {
    rootPage: any = TutorialPage;
    menuList: IMenu[];
    loggedIn = false;

    constructor(
        private app: IonicApp,
        private events: Events,
        platform: Platform,
        private menu : MenuService  
    ) {
        // Call any initial plugins when ready
        platform.ready().then(() => {
            StatusBar.styleDefault();
        });
        this.menuList = menu.getList();
    }

    ngAfterViewInit() {
        
    }

    openPage(page: IMenu) {
        let nav = this.app.getComponent('nav');
        nav.push(Iframe, page);
    }
}
