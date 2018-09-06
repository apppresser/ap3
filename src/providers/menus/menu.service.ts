import {Injectable, isDevMode} from '@angular/core';

import {GlobalVars} from "../../providers/globalvars/globalvars";
import {Iframe} from "../../pages/iframe/iframe";

@Injectable()
export class MenuService {

  menu: any[] = [];
  tabs: any[] = [];

  constructor(
    private globalvars: GlobalVars
  ) {}

  /**
   * 
   * @param menuIndex number
   * @param menuType 'menu' or 'tab'
   */
  getMenuItem(menuIndex, menuType) {
    if(menuType == 'tab')
      return this.getTab(menuIndex);
    else
      return this.getMenu(menuIndex);
  }

  getMenu(index: number) {
    if(this.menu[index])
      return this.menu[index]
    
    return false;
  }

  getTab(index: number) {
    if(this.tabs[index])
      return this.tabs[index]
    return false;
  }

  getItemRoot(menuItem) {

    var root:any = Iframe;

    if( menuItem.type === 'apppages' && menuItem.page_type === 'list' ) {
      root = 'PostList';
    } else if( menuItem.type === 'apppages' && menuItem.page_type === 'media-list' ) {
      root = 'MediaList';
    } else if( menuItem.type === 'apppages' ) {
      root = this.getPageModuleName(menuItem.page_id);
    }

    return root;
  }

  getPageModuleName(page_id) {
    if(!isDevMode())
      return 'Page'+page_id;
    if(false === this.globalvars.getUseDynamicPageModule()) // building on remote Ionic builder
      return 'Page'+page_id;
    else
      return 'CustomPage';
  }

  /**
	 * Side or tab menus
	 * @param slug page slug or URL
	 * @param menuType menu type
	 */
	getIndexBySlug(slug: string, menuType) {
		let menu_index: number;
    let count: number = 0;
    let pages = null;
    
    if(typeof menuType == 'object') {
      pages = menuType;
    } else {
      pages = (menuType == 'tab') ? this.tabs : this.menu;
    }

		if(!pages)
			return menu_index;

		for(let page of pages) {
			if(page.slug && page.slug == slug) {
				menu_index = count;
			} else if(page.url && page.url == slug) {
				menu_index = count;
			}
			count++;
		};

		if(!menu_index && menu_index !== 0)
			console.log('Are you looking for page slugs?', pages); // you can find the slugs here

    	return menu_index;
  }
}