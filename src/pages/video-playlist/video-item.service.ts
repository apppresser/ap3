import { Injectable } from "@angular/core";
import { VideoItem } from "./video-item.model";

@Injectable()
export class VideoItemService {
	public data: any;

	public constructor() {
		this.data = [
			new VideoItem(
				{
					featured_image_urls: {
						thumbnail: 'https://faithbible.breezechms.com/files/5a34348052150/ConvesationPeaceArtwork_1.JPG'
					},
					title: {rendered: 'Learn How to Thrive When Your World is Shaken Up'},
					appp: {
						post_list: {
							below_title: 'When life doesn\'t go as planned, it\''
						}
					},
					src: '/video/FBC20180107full.mp4',
					type: "type: 'video/mp4'"
				}
			),
		
			new VideoItem(
				{
					featured_image_urls: {
						thumbnail: 'https://faithbible.breezechms.com/files/5a34348052150/ConvesationPeaceArtwork_1.JPG'
					},
					title: {rendered: 'Learn How to Thrive When Your World is Shaken Up'},
					appp: {
						post_list: {
							below_title: 'When life doesn\'t go as planned, it\''
						}
					},
					src: '/video/FBC20171217full.mp4',
					type: "type: 'video/mp4'"
				}
			),
			new VideoItem(
				{
					featured_image_urls: {
						thumbnail: 'https://faithbible.breezechms.com/files/5a34348052150/ConvesationPeaceArtwork_1.JPG'
					},
					title: {rendered: 'Learn How to Thrive When Your World is Shaken Up'},
					appp: {
						post_list: {
							below_title: 'When life doesn\'t go as planned, it\''
						}
					},
					src: '/video/FBC20180107full.mp4',
					type: "type: 'video/mp4'"
				}
			),
			new VideoItem(
				{
					featured_image_urls: {
						thumbnail: 'https://faithbible.breezechms.com/files/5a34348052150/ConvesationPeaceArtwork_1.JPG'
					},
					title: {rendered: '(Audio mp3) Learn How to Thrive When Your World is Shaken Up'},
					appp: {
						post_list: {
							below_title: 'When life doesn\'t go as planned, it\''
						}
					},
					src: '/audio/fbc20180107b-making-much-of-jesus.mp3',
					type: "type: 'video/mp3'"
				}
			),
			new VideoItem(
				{
					featured_image_urls: {
						thumbnail: 'https://faithbible.breezechms.com/files/5a34348052150/ConvesationPeaceArtwork_1.JPG'
					},
					title: {rendered: 'Learn How to Thrive When Your World is Shaken Up'},
					appp: {
						post_list: {
							below_title: 'When life doesn\'t go as planned, it\''
						}
					},
					src: '/video/FBC20180107full.mp4',
					type: "type: 'video/mp4'"
				}
			),
			new VideoItem(
				{
					featured_image_urls: {
						thumbnail: 'https://faithbible.breezechms.com/files/5a34348052150/ConvesationPeaceArtwork_1.JPG'
					},
					title: {rendered: 'Learn How to Thrive When Your World is Shaken Up'},
					appp: {
						post_list: {
							below_title: 'When life doesn\'t go as planned, it\''
						}
					},
					src: '/video/FBC20180107full.mp4',
					type: "type: 'video/mp4'"
				}
			),
			new VideoItem(
				{
					featured_image_urls: {
						thumbnail: 'https://faithbible.breezechms.com/files/5a34348052150/ConvesationPeaceArtwork_1.JPG'
					},
					title: {rendered: 'Learn How to Thrive When Your World is Shaken Up'},
					appp: {
						post_list: {
							below_title: 'When life doesn\'t go as planned, it\''
						}
					},
					src: '/video/FBC20180107full.mp4',
					type: "type: 'video/mp4'"
				}
			),
			new VideoItem(
				{
					featured_image_urls: {
						thumbnail: 'https://faithbible.breezechms.com/files/5a34348052150/ConvesationPeaceArtwork_1.JPG'
					},
					title: {rendered: 'Learn How to Thrive When Your World is Shaken Up'},
					appp: {
						post_list: {
							below_title: 'When life doesn\'t go as planned, it\''
						}
					},
					src: '/video/FBC20180107full.mp4',
					type: "type: 'video/mp4'"
				}
			),
			new VideoItem(
				{
					featured_image_urls: {
						thumbnail: 'https://faithbible.breezechms.com/files/5a34348052150/ConvesationPeaceArtwork_1.JPG'
					},
					title: {rendered: 'Learn How to Thrive When Your World is Shaken Up'},
					appp: {
						post_list: {
							below_title: 'When life doesn\'t go as planned, it\''
						}
					},
					src: '/video/FBC20180107full.mp4',
					type: "type: 'video/mp4'"
				}
			)
			];
	}

	public getData() {
		return new Promise((resolve, reject)=>{

			setTimeout(()=> {
				resolve(this.data);
			}, 4000)
		});
	}

}