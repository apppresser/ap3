import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import { HttpParams } from '@angular/common/http';
import { Language } from "../../models/language.model";

export class LanguageService {
	private langObs = new Subject<Language>();
	public language: Language;

	constructor() {
		this.language = new Language();
	}

	setLanguage(language: Language) {
		this.language = language;
		this.langObs.next(this.language);
	}

	setCurrentLanguage(language: String) {

		console.log('LanguageService setCurrentLanguage language', language);

		this.language.current = language;
		this.langObs.next(this.language);
	}

	setAvailable(languages: any) {
		this.language.available = languages;
	}

	/**
	 * The current language: 'en'
	 */
	getCurrentLanguage() {
		return this.language.current;
	}

	removeLanguage() {
		this.language = null;
		this.langObs.next(null);
	}

	languageStatus(): Observable<Language> {
		// return the observable
		return this.langObs;
	}

	appendUrlLang(url) {

		if(typeof url === 'undefined')
			return '';

		// console.log('LanguageService appendUrlLang start', url);

		let params = new HttpParams();

		// remove the existing language
		url = url.replace(new RegExp("lang=[a-z]{2}","gm"), '');

		// gather any #
		let url_parts = url.split('#');
		let hash = (url_parts[1]) ? '#'+url_parts[1]:'';
	
		// gather any ?
		url_parts = url_parts[0].split('?');
		let base_url = url_parts[0];
		let query = url_parts[1];

		if(query && url.indexOf('appp=3') >= 0) {
			// already has appp=3
			params = new HttpParams({
				fromString: query
			});
		} else {
			// add the appp=3
			params = new HttpParams({
				fromString: (query) ? query+'&appp=3':'appp=3'
			});
		}
		
		// add the lang=X
		let lang = this.getCurrentLanguage();
		if( lang )
			params = params.append('lang', lang.toString()); // Silly, convert String to primative string
	
		// put it all together
		url = base_url + '?' + params.toString() + hash;

		// remove empty params
		url = url.replace('&=&', '&');

		// console.log('LanguageService appendUrlLang end', url);
	
		return url;
	
	  }
}