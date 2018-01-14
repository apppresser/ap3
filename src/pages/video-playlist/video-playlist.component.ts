import { Component, OnInit } from '@angular/core';
import { VgAPI } from 'videogular2/core';
import { VideoItem } from "./video-item.model";
import { VideoItemService } from "./video-item.service";

@Component({
  selector: 'app-video-playlist',
  templateUrl: './video-playlist.component.html'
  // https://github.com/videogular/videogular2-showroom/blob/master/src/app/smart-playlist/smart-playlist.component.html
})
export class VideoPlaylistComponent implements OnInit {

  public playlist: Array<VideoItem> = [];
  private api: VgAPI;
  public currentIndex = 0;
  public currentItem: VideoItem;

  constructor(
    private videoitemservice: VideoItemService
  ) { }

  ngOnInit() {
    this.videoitemservice.getData().then(data => {

      console.log('playlist data', data);
      
      this.playlist = <VideoItem[]>data;
      this.currentItem = this.playlist[0];
      
    });
  }

  onPlayerReady(api:VgAPI) {
    // Documentation: http://videogular.github.io/videogular2/docs/getting-started/using-the-api.html
    this.api = api;

    this.api.getDefaultMedia().subscriptions.loadedMetadata.subscribe(this.playVideo.bind(this));
    this.api.getDefaultMedia().subscriptions.ended.subscribe(this.nextVideo.bind(this));
  }

  doRefresh($event) {

  }

  loadMore($event) {

  }

  nextVideo() {
    this.currentIndex++;

    if (this.currentIndex === this.playlist.length) {
      this.currentIndex = 0;
    }

    this.currentItem = this.playlist[this.currentIndex];
  }

  playVideo() {
    this.api.play();
  }

  onClickPlaylistItem($event, item: VideoItem, index: number) {
    console.log('change video', item.src);
    this.currentIndex = index;
    this.currentItem = item;
  }

}
