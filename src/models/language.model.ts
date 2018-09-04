export class Language {
	public code: string = 'en';
	public available: any[];
	public dir: string = 'ltr';
	
	public constructor(data?: {code,dir}) {

		if(data) {
			if(data.code)
				this.code = data.code;
			if(data.dir)
				this.dir = data.dir;
		}
	}

	isRTL() {
		return (this.dir && this.dir == 'rtl');
	}
}