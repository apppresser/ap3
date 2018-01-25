import { Injectable } from "@angular/core";
import { VideoItem } from "./video-item.model";
import {Posts} from '../../providers/posts/posts';

@Injectable()
export class VideoItemService {
	// public data: any;
	public feed: any;

	public constructor(
		private postService: Posts, 
	) {

		this.feed = 'https://www.winknews.com/wp-json/wp/v2/posts?categories=16947,17358,16948,16949,16950,17347,17387,17388';
		// this.feed = 'http://home.thiessen.us/wink.json.php';

		// this.data = [
		// 	new VideoItem(
		// 		{
		// 			featured_image_urls: {
		// 				thumbnail: 'https://faithbible.breezechms.com/files/5a34348052150/ConvesationPeaceArtwork_1.JPG'
		// 			},
		// 			title: {rendered: 'Learn How to Thrive When Your World is Shaken Up'},
		// 			appp: {
		// 				post_list: {
		// 					below_title: 'When life doesn\'t go as planned, it\''
		// 				}
		// 			},
		// 			src: '/video/FBC20180107full.mp4',
		// 			type: "type: 'video/mp4'"
		// 		}
		// 	),
		
		// 	new VideoItem(
		// 		{
		// 			featured_image_urls: {
		// 				thumbnail: 'https://faithbible.breezechms.com/files/5a34348052150/ConvesationPeaceArtwork_1.JPG'
		// 			},
		// 			title: {rendered: 'Learn How to Thrive When Your World is Shaken Up'},
		// 			appp: {
		// 				post_list: {
		// 					below_title: 'When life doesn\'t go as planned, it\''
		// 				}
		// 			},
		// 			src: '/video/FBC20171217full.mp4',
		// 			type: "type: 'video/mp4'"
		// 		}
		// 	),
		// 	new VideoItem(
		// 		{
		// 			featured_image_urls: {
		// 				thumbnail: 'https://faithbible.breezechms.com/files/5a34348052150/ConvesationPeaceArtwork_1.JPG'
		// 			},
		// 			title: {rendered: 'Learn How to Thrive When Your World is Shaken Up'},
		// 			appp: {
		// 				post_list: {
		// 					below_title: 'When life doesn\'t go as planned, it\''
		// 				}
		// 			},
		// 			src: '/video/FBC20180107full.mp4',
		// 			type: "type: 'video/mp4'"
		// 		}
		// 	),
		// 	new VideoItem(
		// 		{
		// 			featured_image_urls: {
		// 				thumbnail: 'https://faithbible.breezechms.com/files/5a34348052150/ConvesationPeaceArtwork_1.JPG'
		// 			},
		// 			title: {rendered: '(Audio mp3) Learn How to Thrive When Your World is Shaken Up'},
		// 			appp: {
		// 				post_list: {
		// 					below_title: 'When life doesn\'t go as planned, it\''
		// 				}
		// 			},
		// 			src: '/audio/fbc20180107b-making-much-of-jesus.mp3',
		// 			type: "type: 'video/mp3'"
		// 		}
		// 	),
		// 	new VideoItem(
		// 		{
		// 			featured_image_urls: {
		// 				thumbnail: 'https://faithbible.breezechms.com/files/5a34348052150/ConvesationPeaceArtwork_1.JPG'
		// 			},
		// 			title: {rendered: 'Learn How to Thrive When Your World is Shaken Up'},
		// 			appp: {
		// 				post_list: {
		// 					below_title: 'When life doesn\'t go as planned, it\''
		// 				}
		// 			},
		// 			src: '/video/FBC20180107full.mp4',
		// 			type: "type: 'video/mp4'"
		// 		}
		// 	),
		// 	new VideoItem(
		// 		{
		// 			featured_image_urls: {
		// 				thumbnail: 'https://faithbible.breezechms.com/files/5a34348052150/ConvesationPeaceArtwork_1.JPG'
		// 			},
		// 			title: {rendered: 'Learn How to Thrive When Your World is Shaken Up'},
		// 			appp: {
		// 				post_list: {
		// 					below_title: 'When life doesn\'t go as planned, it\''
		// 				}
		// 			},
		// 			src: '/video/FBC20180107full.mp4',
		// 			type: "type: 'video/mp4'"
		// 		}
		// 	),
		// 	new VideoItem(
		// 		{
		// 			featured_image_urls: {
		// 				thumbnail: 'https://faithbible.breezechms.com/files/5a34348052150/ConvesationPeaceArtwork_1.JPG'
		// 			},
		// 			title: {rendered: 'Learn How to Thrive When Your World is Shaken Up'},
		// 			appp: {
		// 				post_list: {
		// 					below_title: 'When life doesn\'t go as planned, it\''
		// 				}
		// 			},
		// 			src: '/video/FBC20180107full.mp4',
		// 			type: "type: 'video/mp4'"
		// 		}
		// 	),
		// 	new VideoItem(
		// 		{
		// 			featured_image_urls: {
		// 				thumbnail: 'https://faithbible.breezechms.com/files/5a34348052150/ConvesationPeaceArtwork_1.JPG'
		// 			},
		// 			title: {rendered: 'Learn How to Thrive When Your World is Shaken Up'},
		// 			appp: {
		// 				post_list: {
		// 					below_title: 'When life doesn\'t go as planned, it\''
		// 				}
		// 			},
		// 			src: '/video/FBC20180107full.mp4',
		// 			type: "type: 'video/mp4'"
		// 		}
		// 	),
		// 	new VideoItem(
		// 		{
		// 			featured_image_urls: {
		// 				thumbnail: 'https://faithbible.breezechms.com/files/5a34348052150/ConvesationPeaceArtwork_1.JPG'
		// 			},
		// 			title: {rendered: 'Learn How to Thrive When Your World is Shaken Up'},
		// 			appp: {
		// 				post_list: {
		// 					below_title: 'When life doesn\'t go as planned, it\''
		// 				}
		// 			},
		// 			src: '/video/FBC20180107full.mp4',
		// 			type: "type: 'video/mp4'"
		// 		}
		// 	)
		// ];

		
	}

	public getData() {
		// return new Promise((resolve, reject)=>{

		// 	setTimeout(()=> {
		// 		resolve(this.data);
		// 	}, 4000)
		// });


		return new Promise((resolve, reject) => {
			this.postService.load(this.feed, '').then(data => {
				resolve(data);
			});
		});

	}

}