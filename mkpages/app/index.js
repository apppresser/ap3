"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AppConfig_1 = require("./AppConfig");
const AppSettings_1 = require("./modules/AppSettings");
const TemplateMaker_1 = require("./modules/TemplateMaker");
const ContentCollector_1 = require("./modules/ContentCollector");
const ProductionProc_1 = require("./modules/ProductionProc");
const AppZip_1 = require("./modules/AppZip");
const fs = require("fs"); // nodejs filesystem
const path = require("path"); // nodejs directory utilities
const process = require("process");
class AppBuilder {
    constructor() {
        this.build_dir = __dirname + '/builds';
        this.intro_page_id = 0;
        this.continue_processing = true;
        this.ran_once = false;
    }
    run() {
        // we need our cli params, or bail
        this.cli_params = this.get_cli_params();
        if (!this.cli_params) {
            return false;
        }
        this.clean_up_old_builds();
        // be sure we have a place to save our files
        fs.access(this.build_dir, (err) => {
            if (err && err.code === 'ENOENT') {
                // mkdir our build dir
                fs.mkdir(this.build_dir);
            }
            // Start by getting myapp settings
            this.get_myappp_settings(); // from api
        });
    }
    clean_up_old_builds() {
        let execSync = require('child_process').execSync;
        execSync('rm -rf builds/app_*');
    }
    /**
     * API call to myapppresser.com
     */
    get_myappp_settings() {
        let app_settings = new AppSettings_1.AppSettings(this.cli_params.site_name, this.cli_params.app_id);
        app_settings.get_settings().then((json) => {
            this.myappp_settings = json;
            if (typeof json === 'object') {
                if (this.myappp_settings.meta.intro_slug != '') {
                    this.set_IntroPage();
                }
                this.make_backup_copies();
                this.set_globalvars();
                const zip = new AppZip_1.AppZip(this.myappp_settings, this.cli_params);
                zip.get_app_zip().then((zip_filename) => {
                    setTimeout(() => {
                        if (zip_filename) {
                            this.zip_basename = zip_filename.toString().replace('.zip', '');
                            this.make_components(zip_filename.toString()).then(done => {
                                setTimeout(() => {
                                    // @TODO instead of a long timeout, trigger an event when ready to continue, if all the pages were created, currently this happends too quickly if there is an error getting page content
                                    if (this.continue_processing)
                                        this.all_pages_downloaded();
                                    else
                                        console.log('Unable to continue');
                                }, 20000);
                            });
                        }
                    }, 10000);
                });
            }
            else {
                console.log(json);
            }
        }, (error) => {
            console.error("Failed!", error);
        });
    }
    // @TODO connect this into an event listener
    all_pages_downloaded() {
        console.log('this.zip_basename', this.zip_basename);
        if (this.zip_basename) {
            // setTimeout(() => {
            const prod = new ProductionProc_1.ProductionProc(this.cli_params, this.zip_basename);
            if (this.ran_once === false) {
                console.log('move_production_files');
                prod.move_production_files();
                this.ran_once = true;
            }
            // }, 3000);
            // const zip = new AppZip(this.myappp_settings, this.cli_params);
            // zip.get_app_zip();
        }
        else {
            this.continue_processing = false;
        }
    }
    /**
     * We need to restore some files to their original state after compiling
     */
    make_backup_copies() {
        let exec = require('child_process').execSync;
        const site_name = this.cli_params.site_name;
        const app_id = this.cli_params.app_id;
        const app_dir = 'app_' + site_name + '_' + app_id;
        exec('mkdir -p builds/' + app_dir + '/bak');
        exec('cp ../src/app/app.component.ts builds/' + app_dir + '/bak/app.component.ts', () => { });
        exec('cp ../src/providers/globalvars/globalvars.ts builds/' + app_dir + '/bak/globalvars.ts', () => { });
    }
    make_components(zip_filename) {
        let menu_items = this.get_menu_items();
        var itemsProcessed = 0;
        return new Promise((resolve, reject) => {
            menu_items.forEach(element => {
                if (this.continue_processing) {
                    if (element.page_type == 'html' || element.page_id == this.intro_page_id) {
                        console.log('processing page: (' + element.page_id + ') ' + element.title);
                        if (zip_filename) {
                            this.make_page_html_component(element, zip_filename);
                        }
                        else {
                            this.make_page_html_component(element, '');
                        }
                    }
                    itemsProcessed++;
                    if (itemsProcessed === menu_items.length) {
                        resolve();
                    }
                }
            });
        });
        // setTimeout(() => {
        // 	// @TODO instead of a long timeout, trigger an event when ready to continue, if all the pages were created, currently this happends too quickly if there is an error getting page content
        // 	if(this.continue_processing)
        // 		this.all_pages_downloaded();
        // 	else
        // 		console.log('Unable to continue');
        // }, 10000);
    }
    get_menu_items() {
        let menu_items = this.myappp_settings.menus.items;
        if (this.myappp_settings.tab_menu && this.myappp_settings.tab_menu.items) {
            if (menu_items) {
                menu_items.push(...this.myappp_settings.tab_menu.items);
            }
            else {
                // This app only has a tab menu
                menu_items = this.myappp_settings.tab_menu.items;
            }
        }
        if (menu_items === null) {
            throw new Error('This app must have a menu');
        }
        return menu_items;
    }
    set_globalvars() {
        const src_folder = 'templates';
        const new_folder = 'globalvars';
        const dest_dir = 'builds/app_' + this.cli_params.site_name + '_' + this.cli_params.app_id;
        const root_folder = path.resolve('../mkpages') + '/';
        const componentMaker = new TemplateMaker_1.TemplateMaker(src_folder, new_folder, dest_dir, root_folder);
        // globalvars
        const template_file = 'globalvars.ts';
        const new_file = 'globalvars.ts';
        componentMaker.build_template(template_file, new_file, [
            // \\ escape these for use with RegEx
            { key: "\\[\\[appp_app_id\\]\\]", value: this.cli_params.app_id },
            { key: "\\[\\[myappp_url\\]\\]", value: this.get_myapp_url() }
        ]);
    }
    set_IntroPage() {
        const root_folder = path.resolve(__dirname, '..', '..') + '/';
        const src_folder = 'src/app';
        const new_folder = 'app';
        const dest_dir = 'mkpages/builds/app_' + this.cli_params.site_name + '_' + this.cli_params.app_id;
        const intro_slug = this.myappp_settings.meta.intro_slug;
        let menu_items = this.get_menu_items();
        let page_id = 0;
        for (let i = 0; i < menu_items.length; i++) {
            if (menu_items[i].slug == intro_slug) {
                page_id = menu_items[i].page_id;
                this.intro_page_id = page_id;
                break;
            }
        }
    }
    /**
     * Each page component consists of
     *
     * 1. html template
     * 2. module
     * 3. compontent
     *
     * Reads the templates of each and replaces matched values with assigned values
     *
     * @param page
     */
    make_page_html_component(page, zip_filename) {
        const page_id = page.page_id;
        let file_name;
        const src_folder = '../src/pages/custom-pages';
        const new_folder = 'page-' + page_id;
        const dest_dir = 'builds/app_' + this.cli_params.site_name + '_' + this.cli_params.app_id;
        const root_folder = path.resolve('./') + '/';
        const componentMaker = new TemplateMaker_1.TemplateMaker(src_folder, new_folder, dest_dir, root_folder);
        if (zip_filename) {
            this.get_page_content(componentMaker, file_name, page_id, page.slug, zip_filename);
        }
        else {
            // html from api
            this.get_page_content(componentMaker, file_name, page_id, page.slug, '');
        }
        // module
        file_name = 'page-' + page_id + '.module.ts';
        componentMaker.build_template('custom-page.module.ts', file_name, [
            { key: 'CustomPage', value: 'Page' + page_id },
            { key: 'custom-page', value: 'page-' + page_id }
        ]);
        // component
        file_name = 'page-' + page_id + '.ts';
        componentMaker.build_template('custom-page.ts', file_name, [
            { key: 'CustomPage', value: 'Page' + page_id },
            { key: 'custom-page', value: 'page-' + page_id }
        ]);
    }
    /**
     * Page content comes from the myapp API. The ContentCollector is the
     * tool to get it. Reads the api, builds the html template from it's
     * content.
     *
     * @param componentMaker Reference to our configured tool
     * @param file_name New file name
     * @param page_id page ID
     */
    get_page_content(componentMaker, file_name, page_id, page_slug, zip_filename) {
        const dest_dir = 'mkpages/builds/app_' + this.cli_params.site_name + '_' + this.cli_params.app_id;
        const contentCollector = new ContentCollector_1.ContentCollector(this.cli_params.site_name);
        file_name = 'page-' + page_id + '.html';
        if (zip_filename) {
            let zip_folder_path = dest_dir + '/' + zip_filename.replace('.zip', '');
            contentCollector.get_page_content_from_zip(page_id, page_slug, zip_folder_path).then(content => {
                componentMaker.build_template('custom-page.html', file_name, [
                    { key: 'Content goes here', value: content }
                ]);
            }).catch((error) => {
                if (error !== false || error.indexOf('json response') > 0) {
                    this.continue_processing = false;
                }
                console.error(error);
            });
        }
        else {
            contentCollector.get_page_content_from_api(page_id).then((content) => {
                componentMaker.build_template('custom-page.html', file_name, [
                    { key: 'Content goes here', value: content }
                ]);
            }).catch((error) => {
                if (error !== false || error.indexOf('json response') > 0) {
                    this.continue_processing = false;
                }
                console.error(error);
            });
        }
    }
    /**
     * Verify that the proper parameters have been supplied to the cli
     *
     * Expects `node app [site_name] [app_id]`
     */
    get_cli_params() {
        let params = process.argv;
        if (typeof params[2] === 'undefined') {
            console.log('Error: Missing site name parameter. Expects `node app [site_name] [app_id]`');
            return;
        }
        if (typeof params[3] === 'undefined') {
            console.log('Error: Missing app id parameter.  Expects `node app [site_name] [app_id]`');
            return;
        }
        return {
            site_name: params[2],
            app_id: params[3]
        };
    }
    /**
     * Uses the AppConfig.ts file to return the API URL.
     */
    get_myapp_url() {
        const protocol = (AppConfig_1.AppConfig.api.server.port == 80) ? 'http://' : 'https://';
        const hostname = AppConfig_1.AppConfig.api.server.hostname;
        const site_name = this.cli_params.site_name;
        return protocol + hostname + '/' + site_name + '/';
    }
}
const appbuilder = new AppBuilder();
appbuilder.run();
