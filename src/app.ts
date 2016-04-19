import {App, IonicApp, Events, Platform, NavController} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {TutorialPage} from './pages/tutorial';
import Iframe from './pages/iframe';

interface MenuObject {
    title: string;
    src: string;
    icon: string;
}

@App({
    template: require('./app.html'),
    providers: [],
    config: {},
    prodMode: __DEV__ ? false : true
})
class ConferenceApp {
    rootPage: any = TutorialPage;
    menu: MenuObject[] = require('./data/menu.json').list;
    loggedIn = false;

    constructor(
        private app: IonicApp,
        private events: Events,
        platform: Platform
    ) {
        // Call any initial plugins when ready
        platform.ready().then(() => {
            StatusBar.styleDefault();
        });
    }

    ngAfterViewInit() {
        
    }

    openPage(page: MenuObject) {
        let nav = this.app.getComponent('nav');
        nav.push(Iframe, page);
    }
}
