import {NavController, NavParams, LoadingController} from 'ionic-angular';
import {Component} from '@angular/core';
import {Posts} from '../../providers/posts/posts';
import {PostDetailsPage} from '../post-details/post-details';
import {GlobalVars} from '../../providers/globalvars/globalvars';

@Component({
  templateUrl: 'post-list.html'
})
export class PostList {
  selectedItem: any;
  icons: string[];
  items: any;
  page: number = 1;
  siteurl: string;
  route: string;
  title: string;

  constructor(public nav: NavController, navParams: NavParams, public postService: Posts, public globalvars: GlobalVars, public loadingController: LoadingController ) { 

    this.siteurl = this.globalvars.getUrl();

    this.route = this.siteurl + '/wp-json/' + navParams.data.list_route;

    this.title = navParams.data.title;
    
  }

  ngOnInit() {

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
    this.postService.load( route, this.page ).then(items => {

      console.log('loadPosts: ', items);
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

    this.postService.load( this.route, this.page ).then(items => {
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