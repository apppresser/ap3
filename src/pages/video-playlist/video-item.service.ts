import { Injectable } from "@angular/core";
import { Events } from 'ionic-angular';
import { VideoItem } from "./video-item.model";
import {Posts} from '../../providers/posts/posts';
import { VideoFeed } from "./video-feed.model";
import { VgAPI } from "videogular2/core";


@Injectable()
export class VideoItemService {
	public api: VgAPI;
	public feeds: Array<VideoFeed>;
	public cat_url: string;
	public data: any;

	constructor(
		private postService: Posts, 
		public events: Events
	) {

		this.cat_url  = 'https://www.winknews.com/wp-json/wp/v2/posts?categories=';

		this.feeds = [
			new VideoFeed(16947, 'latest-news', 'Latest Videos'),
			new VideoFeed(17347, 'your-health-now', 'Your Health Now'),
			new VideoFeed(16949, 'fitness-friday', 'Fitness Friday'),
			new VideoFeed(16950, 'golf-doctor', 'Golf Doctor'),
			new VideoFeed(16948, 'pet-pals', 'Pet Pals'),
			new VideoFeed(17358, 'wheres-wink', 'Where\'s WINK'),
			new VideoFeed(17387, 'lets-eat', 'Let\'s Eat'),
			new VideoFeed(17388, 'healthy-kids', 'Healthy Kids'),
		];
	}

	public setApi(api: VgAPI) {
		this.api = api;
		this.events.subscribe('videostop', (event) => {
			this.api.pause();
		});
	}

	public getVideoCategoryData( feed: VideoFeed ) {
		return new Promise((resolve, reject) => {

			let url = this.cat_url + feed.id;

			this.postService.load(url, '').then(data => {

				// console.log('the video feed for ' + feed.name, data);

				resolve(data);
			});
		});
	}

}