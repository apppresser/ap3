import { Injectable } from "@angular/core";
import { VideoItem } from "./video-item.model";
import {Posts} from '../../providers/posts/posts';
import { VideoFeed } from "./video-feed.model";


@Injectable()
export class VideoItemService {
	// public data: any;
	public feeds: Array<VideoFeed>;
	public cat_url: string;

	constructor(
		private postService: Posts, 
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

	public getVideoCategoryData( feed: VideoFeed ) {
		return new Promise((resolve, reject) => {

			let url = this.cat_url + feed.id;

			this.postService.load(url, '').then(data => {

				console.log('the video feed for ' + feed.name, data);

				resolve(data);
			});
		});
	}

}