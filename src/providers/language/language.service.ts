import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import {Http, Response} from '@angular/http';
import { HttpParams } from '@angular/common/http';
import {Storage} from '@ionic/storage';
import { Language } from "../../models/language.model";
import { AnalyticsService } from "../analytics/analytics.service";

@Injectable()
export class LanguageService {
	private langObs = new Subject<Language>();
	public language: Language;
	public hasStoredLanguage = false;

	constructor(
		private analyticsservice: AnalyticsService,
		private storage: Storage,
		private http: Http
	) {
		this.language = new Language();
	}

	setLanguage(language: Language) {
		this.language = language;
		this.langObs.next(this.language);
	}

	initStoredLanguage() {
		this.storage.get( 'app_language' ).then( lang => {
			if( lang ) {
				this.hasStoredLanguage = true;
				this.setCurrentLanguage(lang);
			}
		});
	}

	setCurrentLanguage(language: Language) {
		this.language.code = language.code;
		this.language.dir = language.dir;
		this.analyticsservice.trackEvent('lang', this.language.code);
		this.storage.set( 'app_language', language );
		this.langObs.next(this.language);
	}

	setAvailable(languages: any) {
		this.language.available = languages;
	}

	/**
	 * The current language: 'en'
	 */
	getCurrentLanguage() {
		return this.language.code;
	}

	removeLanguage() {
		this.language = null;
		this.langObs.next(null);
	}

	languageStatus(): Observable<Language> {
		// return the observable
		return this.langObs;
	}

	removeAppParams(url, use_language) {
		
		// gather any #
		let url_parts = url.split('#');
		let hash = (url_parts[1]) ? '#'+url_parts[1]:'';
	
		// gather any ?
		url_parts = url_parts[0].split('?');
		let base_url = url_parts[0];
		let query = url_parts[1];
		
		query = query.replace('appp=3','');
	
		// maybe remove the existing language
		if(use_language === false) {
			query = query.replace(new RegExp("lang=[a-z]{2}","gm"), '');
		}
	
		// trim the ampersands
		query = query.replace(/^\&+|\&+$/g, '');
		query = query.replace('&&', '&');
	
		url = (query) ? base_url+"?"+query : base_url;
	
		return url + hash;
	}

	appendUrlLang(url) {

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

	langFileExists(data): Promise<Language> {
		return new Promise<Language>( (resolve, reject) => {

      		let fallbackLang = new Language({
        		code:'en',
				dir: 'ltr'
      		});

			if(data.default_language) {

        		let langDefault = new Language({
          			code: data.default_language,
					dir: (data.meta.rtl) ? 'rtl' : 'ltr'
        		});

        		this.http.get( './assets/i18n/'+langDefault.code+'.json' )
					.subscribe((response: Response) => {

						let new_lang: Language = langDefault;
						let parsedLangData = response.json();
				
						if(parsedLangData) {
							new_lang.dir = (parsedLangData.dir) ? parsedLangData.dir : langDefault.dir;
						}

						// language file exists, return url 
						resolve(new_lang);
				},
				error => {
					// language file does not exist
					resolve(fallbackLang);
				});

			} else {
				resolve(fallbackLang);
			}
	    });
	}
}