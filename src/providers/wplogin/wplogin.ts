import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import { LoginService } from '../logins/login.service';
import { User } from "../../models/user.model";

/* 
 * Login to WordPress from the app
*/
@Injectable()
export class WPlogin {
  data: any = null;
  url: any;

  constructor(
    private loginservice: LoginService,
    private http: Http
  ) {

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

      let url = this.url + 'wp-admin/admin-ajax.php?action=apppajaxlogin';
      const data = {
        action: 'apppajaxlogin',
        username: form.user,
        password: form.pass
      };

      var formData = new FormData();

      formData.append("username", form.user);
      formData.append("password", form.pass);

      var request = new XMLHttpRequest();
      request.open("POST", url);
      request.send(formData);
      request.onload = (e) => {
        if (request.readyState === 4) {
          if (request.status === 200) {

            try {
              let login_data = (<any>JSON.parse(request.responseText)).data;
              if(typeof login_data.username !== 'undefined') {
                this.loginservice.setLoginStatus(new User(login_data));
              }
            } catch (error) {
              console.log(error)
            }

            resolve(JSON.parse(request.responseText));
          } else {
            reject(JSON.parse(request.statusText));
          }
        }
      };

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