export class Page {
	public title: string;
	public slug: string;
	public page_id: number;
	public component: string;
	public target: string;
	public class: string;
	public extra_classes: string;
	public url: string;
	public navparams: any;
	public is_home: boolean = false;
	public page_type: string;
	public type: string;

	is_nav_divider() {
		return ( this.extra_classes && this.extra_classes.indexOf('divider') >= 0 );
	}
}