import {Injectable} from 'angular2/core';

export interface IMenu {
    title: string;
    src: string;
    icon: string;
}

@Injectable()
export default class {
    list: IMenu[];
    home: IMenu;

    constructor() {
        let data = require('../data/menu.json');
        this.list = data.list;
        this.home = data.home;
    }

    getHome() {
        return this.home;
    }

    getList() {
        return this.list;
    }
}
