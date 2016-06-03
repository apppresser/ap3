import {Page} from 'ionic-angular';

@Page({
	templateUrl: 'build/pages/tabs/tabs.html'
})
export class TabsTextPage {
	constructor() {
		this.tab1 = TabsTextContentPage;
		this.tab2 = TabsTextContentPage;
	}
}