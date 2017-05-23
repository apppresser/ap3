import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';

/* 
 * Login to WordPress from the app
*/
@Injectable()
export class WPlogin {
  data: any = null;
  url: any;

  constructor(public http: Http) {

    let item = window.localStorage.getItem( 'myappp' );
    this.url = JSON.parse( item ).wordpress_url;

  }

  /* Returns promise.
   * Usage: 
   */
  login( form: any ) {

    return new Promise( (resolve, reject) => {

      if( !this.url )
        reject({ data: { message: "No WordPress URL set. " } })

      let auth = btoa( form.user + ':' + form.pass )

      let url = this.url + 'wp-admin/admin-ajax.php?action=apppajaxlogin' + '&auth=' + auth;

      this.http.get( url )
        .map(res => res.json())
        .subscribe(data => {

            if( data.success == true )
              resolve(data);

            reject(data)
          },
          error => {

            reject(error);
          }
        );

    });
    
  }

  logout() {

    return new Promise( (resolve, reject) => {

      let url = this.url + 'wp-admin/admin-ajax.php?action=apppajaxlogout';

      this.http.get( url )
        .map(res => res.json())
        .subscribe(data => {
          
            if( data.success == true )
              resolve(data)

            reject(data)

          },
          error => {

            reject(error);

          }
        );

    });
    
  }

  handleError(err) {
    console.warn(err);
  }
}