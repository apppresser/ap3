export class VideoItem {
	public featured_image_urls: {thumbnail?: string};
	public appp: Appp;
	public title: {rendered:any};
	public excerpt: {rendered:any};
	public type: string;
	public src: string;

	public constructor(
		item?: {
			featured_image_urls?: {
				thumbnail?: string
			},
			appp?: any,
			title?: {rendered:any},
			excerpt?: {rendered:any},
			app?: Appp,
			src?: string,
			type?: string
		}
	) {
		this.featured_image_urls = item.featured_image_urls
		this.appp = item.appp;
		this.title = item.title;
		this.excerpt = item.excerpt;
		this.type = item.type;
		this.src = item.src;
	}
}

class Appp {
	public post_list: {above_title: string, below_title: string, below_content: string};
}