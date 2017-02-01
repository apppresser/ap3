import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';

/* 
 * Login to WordPress from the app
*/
@Injectable()
export class WPlogin {
  data: any = null;

  constructor(public http: Http) {
  }

  /* Returns promise.
   * Usage: 
   */
  login( form: any ) {

    return new Promise( (resolve, reject) => {

      let url = 'http://10.82.111.96/wp-admin/admin-ajax.php?action=apppajaxlogin';
      let auth = btoa( form.user + ':' + form.pass );

      let headers = new Headers({ 'Authorization': 'Basic ' + auth });
      let options = new RequestOptions({ headers: headers });

      this.http.post( url, null, options )
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

      let url = 'http://10.82.111.96/wp-admin/admin-ajax.php?action=apppajaxlogout';

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