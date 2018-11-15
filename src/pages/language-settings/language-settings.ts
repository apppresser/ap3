import {Component} from '@angular/core';
import {ViewController, ToastController, IonicPage, NavParams} from 'ionic-angular';
import {Storage} from '@ionic/storage';
import {TranslateService} from '@ngx-translate/core';
import { LanguageService } from "../../providers/language/language.service";
import { Language } from '../../models/language.model';

@IonicPage()
@Component({
  templateUrl: 'language-settings.html',
  selector: 'language-settings'
})
export class LanguageSettings {

  languages: any;
  title: string = '';

  constructor( 
    private navParams: NavParams,
    public storage: Storage,
    public viewCtrl: ViewController,
    public toastCtrl: ToastController,
    private languageservice: LanguageService,
    public translate: TranslateService
    ) {
      if(this.navParams.get('title')) {
        this.title = this.navParams.get('title');
      } else {
        this.title = 'Language Settings';
      }
  }

  ionViewWillEnter() {
    this.getLanguages()
  }

  // first get existing checked segments
  getLanguages() {

    this.languages = null
  
    // Get languages, these are sent from WP site through postMessage in main component
    this.storage.get('available_languages').then( langs => {

      if(langs) {
        // this.languageservice.setAvailable(langs);
        // this.languages = langs
        this.checkCurrent( langs )
      }

    })
    
  }

  checkCurrent( langs ) {

    this.storage.get( 'app_language' ).then( lang => {

      if( lang ) {
        // we have an existing language, check it and return languages
        for (var i = langs.length - 1; i >= 0; i--) {

          // if language codes match, save as checked
          if(langs[i].code === lang.code || langs[i].code === lang) {
            langs[i].checked = true
          }

        }
        
      }

      this.languages = langs
      
    })

  }

  onToggleLanguage( event, language ) {
    this.toggleLanguage(language);
  }

  toggleLanguage( new_language ) {

    this.setLanguage(new_language);

    this.translate.get('Language changed').subscribe( text => {
      this.presentToast(text);
    });

  }

  setLanguage(new_language) {
    let language = new Language({
      code: new_language.code,
      dir: (new_language.dir && new_language.dir === 'rtl') ? 'rtl' : 'ltr'
    });

    this.translate.use( language.code )
    this.storage.set( 'app_language', language )
    this.languageservice.setCurrentLanguage(language);
  }

  presentToast(msg) {

    let toast = this.toastCtrl.create({
      message: msg,
      duration: 5000,
      position: 'bottom'
    });

    toast.present();

  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}