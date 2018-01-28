import { Component, OnInit } from '@angular/core';
import { VgAPI } from 'videogular2/core';
import { VideoItem } from "./video-item.model";
import { VideoItemService } from "./video-item.service";
import { VideoFeed } from './video-feed.model';

@Component({
  selector: 'app-video-playlist',
  templateUrl: './video-playlist.component.html'
  // https://github.com/videogular/videogular2-showroom/blob/master/src/app/smart-playlist/smart-playlist.component.html
})
export class VideoPlaylistComponent implements OnInit {

  public currentIndex = 0;
  public currentCatFeed: VideoFeed;
  public currentItem: VideoItem;
  public livestream = false;
  public currentStream = '';
  public categories: Array<VideoFeed>;

  constructor(
    private videoitemservice: VideoItemService
  ) { }

  ngOnInit() {

    if(this.videoitemservice.feeds[0].videos.length === 0) {
      this.getVideoFeed();
    } else if( !this.categories ) {
      this.categories = this.videoitemservice.feeds;
      this.currentItem = this.categories[0].videos[0];
      this.currentCatFeed = this.categories[0];
      this.playVideo();
    }
  }

  getVideoFeed() {
    this.categories = this.videoitemservice.feeds;

    this.currentStream = ''; //"'https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8'";

    // console.log('is it defined?', this.categories);

    let loopCount = 0;

    this.categories.forEach(feed => {
      // console.log('go get this feed', feed);

      this.videoitemservice.getVideoCategoryData(feed).then(data => {

        let posts = <any[]>data;
  
        for(var i=0;i<posts.length;i++) {
  
          let video = new VideoItem(posts[i]);
          // console.log(video, video.src);
          if(video.src) {
            feed.videos.push(video);
          }
        }
  
        if(loopCount === 0) {
          this.currentItem = feed.videos[0];
          this.currentCatFeed = feed;
        }

        loopCount++;
        
      });
    })
  }

  addLiveStream() {
    // live stream
    // this.playlist.push(new VideoItem({
    //   featured_image_urls: {
    //     thumbnail: ''
    //   },
    //   // appp: undefinded,
    //   title: {rendered:'Livestream'},
    //   excerpt: {rendered:'Livestreaming now'},
    //   // app: Appp,
    //   video_clip: 'https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8',
    //   category: 'live'
    // }));
  }

  onPlayerReady(api:VgAPI) {
    // Documentation: http://videogular.github.io/videogular2/docs/getting-started/using-the-api.html
    this.videoitemservice.setApi(api);

    // Auto play
    this.videoitemservice.api.getDefaultMedia().subscriptions.loadedMetadata.subscribe(this.playVideo.bind(this));

    // Auto next
    this.videoitemservice.api.getDefaultMedia().subscriptions.ended.subscribe(this.nextVideo.bind(this));
    
  }

  doRefresh($event) {
    this.getVideoFeed();
  }

  loadMore($event) {
    this.getVideoFeed();
  }

  nextVideo() {

    // console.log('play the next video');
    this.currentIndex++;

    if (this.currentIndex === this.currentCatFeed.videos.length) {
      this.currentIndex = 0;
    }

    this.currentItem = this.currentCatFeed.videos[this.currentIndex];
  }

  playVideo() {
    if(this && this.videoitemservice.api && this.videoitemservice.api.play) {
      this.videoitemservice.api.play();
    }
  }

  stopVideo() {

    console.log('stopVideo');

    if(this && this.videoitemservice.api && this.videoitemservice.api.pause) {
      this.videoitemservice.api.pause();
    }
  }

  onClickPlaylistItem($event, item: VideoItem, videoFeed: VideoFeed, index: number) {

    console.log('videoFeed', videoFeed);
    console.log('index', index);

    // this.livestream = false;

    console.log('change video', item.src);
    if(item.src == this.currentItem.src) {
      console.log('Already playing this video');
      return;
    }

    this.currentCatFeed = videoFeed;
    this.currentItem = item;
  }

}
