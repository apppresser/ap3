import {NavController, NavParams, LoadingController} from 'ionic-angular';
import {Component, ViewChild, ElementRef} from '@angular/core';
import {Posts} from '../../providers/posts/posts';
import {PostDetailsPage} from '../post-details/post-details';
import {GlobalVars} from '../../providers/globalvars/globalvars';

@Component({
  templateUrl: 'build/pages/post-list-viewchild/post-list.html'
})
export class PostListViewChild {
  selectedItem: any;
  icons: string[];
  items: any;
  page: number = 1;
  siteurl: string;
  route: string;

  @ViewChild('routing') routeEl: ElementRef;

  constructor(private nav: NavController, navParams: NavParams, public postService: Posts, private globalvars: GlobalVars, private loadingController: LoadingController ) {    
  }

  // helper func to get our route hardcoded in template
  // http://stackoverflow.com/questions/39603573/angular-2-get-component-variable-from-template/39607729#39607729
  _getAttributeValue(element: ElementRef, name: string, defaultVal: any): any {
    let attribute = element.nativeElement.attributes.getNamedItem(name);
    if (!attribute) return defaultVal;
    return attribute.nodeValue;
  }

  // Get attribute value using viewchild. viewchilds are only valid after this event !!
  ngAfterViewInit() {
    this.route = this._getAttributeValue(this.routeEl, 'route', '/wp/v2/posts');

    console.log(this.route);

    this.siteurl = this.globalvars.getUrl();
    this.loadPosts( this.route );
  }

  loadPosts( route ) {

    let loading = this.loadingController.create({
        showBackdrop: false,
        dismissOnPageChange: true
    });

    loading.present(loading);

    this.page = 1;
    
    // any menu imported from WP has to use same component. Other pages can be added manually with different components
    this.postService.load( this.siteurl + '/wp-json' + route, this.page ).then(items => {

      // console.log(items);
      // Loads posts from WordPress API
      this.items = items;
      // load more right away
      this.loadMore(null);
      loading.dismiss();
    });

  }

  itemTapped(event, item) {
    this.nav.push(PostDetailsPage, {
      item: item
    });
  }

  doRefresh(refresh) {
    this.loadPosts( this.route );
    // refresh.complete should happen when posts are loaded, not timeout
    setTimeout( ()=> refresh.complete(), 500);
  }

  loadMore(infiniteScroll) {

    this.page++;

    this.postService.load( this.siteurl + this.route, this.page ).then(items => {
      // Loads posts from WordPress API
      let length = items["length"];

      if( length === 0 ) {
        infiniteScroll.complete();
        return;
      }

      for (var i = length - 1; i >= 0; i--) {
        this.items.push( items[i] );
      }

      infiniteScroll.complete();
    });
  }
}