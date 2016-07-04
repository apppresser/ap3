import {Injectable} from '@angular/core';

/*
  Store global variables to use throughout app

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class GlobalVars {

  url: string = 'http://10.0.1.12/';

  constructor() {}

  getUrl() {
    return this.url;
  }

}