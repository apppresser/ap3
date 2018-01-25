export class VideoItem {
	public featured_image_urls: {thumbnail?: string};
	public appp: Appp;
	public title: {rendered:any};
	public excerpt: {rendered:any};
	public type: string;
	public src: string;
	public category: string;

	public constructor(
		item?: {
			featured_image_urls?: {
				thumbnail?: string
			},
			appp?: any,
			title?: {rendered:any},
			excerpt?: {rendered:any},
			app?: Appp,
			video_clip?: any,
			src?: string,
			media_type?: string,
			category?: string
		}
	) {
		this.featured_image_urls = item.featured_image_urls
		this.appp = item.appp;
		this.title = item.title;
		this.excerpt = item.excerpt;
		this.src = this.getVideo(item.video_clip);
		this.type = (typeof item.media_type === 'undefined') ? this.getType() : item.media_type;
	}

	private getVideo(video) {

		if(typeof video === 'string') {
			return video;
		}

		if(video && video[0]) {
			return video[0];
		}

		return '';
	}

	private getType() {
		if(this.src) {
			if(this.src.indexOf('.mp4') > 0) {
				return 'type: \'video/mp4\'';
			}

			if(this.src.indexOf('.mp3') > 0) {
				return 'type: \'video/mp3\'';
			}
		}

		return '';
	}
}

class Appp {
	public post_list: {above_title: string, below_title: string, below_content: string};
}