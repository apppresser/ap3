# Ionic app files for AppPresser 3

These are the files used to compile mobile apps using [AppPresser](https://apppresser.com). They are based on [Ionic 2](http://ionicframework.com/), and use Angular 2 and Typescript.

This repository is for developers using AppPresser who want to make a lot of custom changes. If you make changes to these files, you cannot use the app builder, because it will overwrite your changes.

If you are not familiar with the command line, Angular 2, and Typescript, we recommend using our visual app builder instead of editing these files.

## Usage

First, make sure you have node and npm installed.

1. Clone this repository, cd into the directory `cd ap3`, and run `npm install`.
2. Install the [Ionic CLI tools](http://ionicframework.com/docs/v2/cli/) 

`sudo npm install -g ionic`

2. Change src/providers/globalvars/globalvars.ts to your myapppresser.com account information. For example:

```
appid: string = '12';
apiurl: string = 'https://myapppresser.com/site-slug/'
endpoint: string = 'wp-json/ap3/v1/app/12';
```

3. Run `ionic serve` to preview the app in your browser

Consult the [Ionic documentation](http://ionicframework.com/docs/v2/cli/) for cli commands, custom components, and more.