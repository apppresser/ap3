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
        this.injector, null, this.elementRef._element.nativeElement
      );

      (<any>this.app)._loadComponent(component);
      component.onDestroy(() => {
        (<any>this.app)._unloadComponent(component);
      });
      return component;
    });
  }

private toComponent(templateUrl, directives = []) {
  @Component({
    selector: 'gen-node',
    templateUrl: templateUrl,
    directives: directives
  })
  class DynComponent {
    dynamic: any;
    constructor(private nav:Nav){
      this.dynamic = "dynamic string";
    }
    openPage(url) {
      // close the menu when clicking a link from the menu

      if (url) {
        this.nav.setRoot(Iframe, { title: '', url: url } );
      }
    }
  }
    return DynComponent;
  }
}