export class Language {
	public current: String = '';
	public available: any;
	public rtl: Boolean;
	
	public constructor(data?) {

		if(data) {
			// this.lang = (data.lang) ? data.lang : '';
			// this.rtl = (data.rtl);
		}
	}
}