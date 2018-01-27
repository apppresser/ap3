import { VideoItem } from "./video-item.model";

export class VideoFeed {
	public id: number;
	public slug: string;
	public name: string;
	public videos: Array<VideoItem> = [];

	constructor(id, slug, name) {
		this.id = id;
		this.slug = slug;
		this.name = name;
	}
}