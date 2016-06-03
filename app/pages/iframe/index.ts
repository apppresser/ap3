import {Page, NavParams} from 'ionic-angular';
// import customIframe from '../../components/iframe/index';


@Page({
    templateUrl: 'build/pages/iframe/index.html'
})
export default class {
    title: string;
    src: string;
    constructor(private navParams: NavParams) {
        this.title = navParams.data.title;
        this.src = navParams.data.src;
        console.log('navParams.data', navParams.data)
    }
    iframeLoaded(e) {
        console.log('iframeLoaded', e)
    }
}
