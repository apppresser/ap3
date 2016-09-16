import {NavController, NavParams, LoadingController} from 'ionic-angular';
import {Component} from '@angular/core';
import {Posts} from '../../providers/posts/posts';
import {PostDetailsPage} from '../post-details/post-details';
import {GlobalVars} from '../../providers/globalvars/globalvars';

@Component({
  templateUrl: 'build/pages/post-list/post-list.html'
})
export class PostList {
  selectedItem: any;
  icons: string[];
  items: any;
  page: number = 1;
  siteurl: string;

  constructor(private nav: NavController, navParams: NavParams, public postService: Posts, private globalvars: GlobalVars, private loadingController: LoadingController ) {

    this.siteurl = globalvars.getUrl();
    this.loadPosts();
    
  }

  loadPosts() {

    let loading = this.loadingController.create({
        showBackdrop: false,
        dismissOnPageChange: true
    });

    loading.present(loading);

    this.page = 1;
    
    // any menu imported from WP has to use same component. Other pages can be added manually with different components
    this.postService.load( this.siteurl + '/wp-json/wp/v2/posts', this.page ).then(items => {
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
    this.loadPosts();
    // refresh.complete should happen when posts are loaded, not timeout
    setTimeout( ()=> refresh.complete(), 500);
  }

  loadMore(infiniteScroll) {

    this.page++;

    this.postService.load( this.siteurl + '/wp-json/wp/v2/posts', this.page ).then(items => {
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
