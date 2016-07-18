import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the Styles provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Styles {
  data: any = null;

  constructor(public http: Http) {}

  load( url: string ) {

    return new Promise(resolve => {

      // need appp=2 because colors come from theme
    this.http.get( url + '?appp=2' )
        .map(res => res.json())
        .subscribe(data => {
          this.data = data;
          console.warn(data);
          resolve(this.data);
        });
    });
  }

}