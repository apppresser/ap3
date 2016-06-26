import {NavController, NavParams} from 'ionic-angular';
import {Component} from '@angular/core';
import {Posts} from '../../providers/posts/posts';
import {PostDetailsPage} from '../post-details/post-details';


@Component({
  templateUrl: 'build/pages/post-list/post-list.html'
})
export class PostList {
  selectedItem: any;
  icons: string[];
  items: any;
  page: number = 1;

  constructor(private nav: NavController, navParams: NavParams, public postService: Posts ) {
    // If we navigated to this page, we will have an item available as a nav param
    this.loadPosts();
  }

  loadPosts() {
    this.page = 1;
    // any menu imported from WP has to use same component. Other pages can be added manually with different components
    this.postService.load( this.page ).then(items => {
      // Loads posts from WordPress API
      this.items = items;
    });

  }

  itemTapped(event, item) {
    this.nav.push(PostDetailsPage, {
      item: item
    });
  }

  loadMore(infiniteScroll) {

    this.page++;
    console.log(this.page);

    this.postService.load( this.page ).then(items => {
      // Loads posts from WordPress API
      let length = items.length;

      console.log( length );
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
