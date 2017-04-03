import {Component} from '@angular/core';
import {ViewController, ToastController} from 'ionic-angular';
import {Storage} from '@ionic/storage';
import {TranslateService} from 'ng2-translate';

@Component({
  templateUrl: 'language-settings.html',
  selector: 'language-settings'
})
export class LanguageSettings {

  languages: any;

  constructor( 
    public storage: Storage,
    public viewCtrl: ViewController,
    public toastCtrl: ToastController,
    public translate: TranslateService
    ) {
    
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
          if( langs[i].code === lang )
            langs[i].checked = true

        }
        
      }

      this.languages = langs
      
    })

  }

  toggleLanguage( event, language ) {

    this.translate.use( language.code )
    this.storage.set( 'app_language', language.code )

    this.presentToast('Language changed')

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