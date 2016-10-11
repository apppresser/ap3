// try http://blog.lacolaco.net/post/dynamic-component-creation-in-angular-2-rc-5/

import {
  Component,
  ComponentResolver,
  Directive,
  ViewContainerRef,
  Input,
  Injector,
  ApplicationRef
} from "@angular/core";
import Iframe from '../../pages/iframe';
import {CustomPage} from '../../pages/custom-pages/custom-page';
import {PostList} from '../../pages/post-list/post-list';
import {Nav} from 'ionic-angular';

/**

  This component render an HTML code with inner directives on it.
  The @Input innerContent receives an array argument, the first array element
  is the code to be parsed. The second index is an array of Components that
  contains the directives present in the code.

  Example:

  <div [innerContent]="[
    'Go to <a [routerLink]="[Home]">Home page</a>',
    [RouterLink]
  ]">

**/
@Directive({
  selector: '[innerContent]'
})
export class InnerContent {

  @Input()
  set innerContent(content){
    this.renderTemplate(
      content[0],
      content[1]
    )
  }

  constructor(
    private elementRef: ViewContainerRef,
    private injector: Injector,
    private app: ApplicationRef,
    private resolver:ComponentResolver){
  }

  public renderTemplate(templateUrl, directives) {
    let dynComponent = this.toComponent(templateUrl, directives)
    this.resolver.resolveComponent(
      dynComponent
    ).then(factory => {
      let component = factory.create(
        this.injector, null, this.elementRef.element.nativeElement
      );

      (<any>this.app)._loadComponent(component);
      component.onDestroy(() => {
        (<any>this.app)._unloadComponent(component);
      });
      return component;
    });
  }

/*
 * Custom page component, created dynamically. Any methods for custom pages go in this class.
 */
private toComponent(templateUrl, directives = []) {
  @Component({
    selector: 'gen-node',
    templateUrl: templateUrl,
    directives: directives
  })
  class DynComponent {
    pages: any;
    tab_menu_items: any;
    constructor(private nav:Nav){
      this.loadPages();
    }

    loadPages() {

      // get all pages from local storage so we can use them in template, to link to other pages
      let data = JSON.parse( window.localStorage.getItem( 'myappp' ) );

      if( data.menus.items ) {
        this.pages = data.menus.items;
      }

      if( data.tab_menu.items ) {
        this.tab_menu_items = data.tab_menu.items;
      }

    }

    setRoot( page ) {

      // linking to another page in the template looks like this: openPage(pages[1])
      if( page.type === 'apppages' && page.page_type === 'list' ) {
        this.nav.setRoot( PostList, page );
      } else if( page.type === 'apppages' ) {
        this.nav.setRoot( CustomPage, page );
      } else if (page.url) {
        this.nav.setRoot(Iframe, page);
      } else {
        this.nav.setRoot(page.component, page.navparams);
      }

    }

    pushPage( page ) {

      // linking to another page in the template looks like this: openPage(pages[1])
      if( page.type === 'apppages' && page.page_type === 'list' ) {
        this.nav.push( PostList, page );
      } else if( page.type === 'apppages' ) {
        this.nav.push( CustomPage, page );
      } else if (page.url) {
        this.nav.push(Iframe, page);
      } else {
        this.nav.push(page.component, page.navparams);
      }

    }

  }
    return DynComponent;
  }
}