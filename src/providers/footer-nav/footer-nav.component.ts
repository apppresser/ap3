import { Component, OnInit, Input, HostListener } from '@angular/core';
import { Events, LoadingController, Platform } from 'ionic-angular';
import { NgForm } from '@angular/forms';

declare let jQuery;

@Component({
  selector: 'app-footer-nav',
  templateUrl: './footer-nav.component.html'
})
export class FooterNavComponent implements OnInit {

  private bodyTag: any;
  private menuOpen = false;
  public searchTerm: any;
  public videoPage: any[];
  public loading: any;
  public filteredMenu: any[];
  public is_iOS = false;

  @Input() menu;

  constructor(
    private platform: Platform,
    public loadingController: LoadingController,
    public events: Events,
  ) { }

  @HostListener('click', ['$event'])
  public onClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  ngOnInit() {

    this.is_iOS = this.platform.is('ios');

    this.setFooterMenuItems();

    // to add/remove body.class
    this.bodyTag = document.getElementsByTagName('body')[0];

    // Add submit listener to search form
    var searchForm = document.querySelector('.td-search-form');
    // console.log(searchForm)
    searchForm.addEventListener('submit',  event =>{
      // console.log('FooterNavComponent searchForm submit event', event);
      event.preventDefault();
    } );

    // console.log('footer menu', this.menu);
    this.setVideoPage(this.menu);


    // Add click listener to all links
    var externalLinks = document.querySelectorAll('a[href^="http://"]');
    for (let i = 0; i < externalLinks.length; ++i) {
        var link = externalLinks[i];
        link.addEventListener('click', event => {
            event.preventDefault();

            let url = (event.target as HTMLElement).getAttribute('href');
            if( url ) {
              this.openPage({url: url});
            }

            this.closeFooterMenu();
        });
    }
  }

  /**
   * Hide the Home and News items in the footer
   */
  setFooterMenuItems() {
    this.filteredMenu = [];

    for(let i=0;i<this.menu.length;i++) {

      if(this.menu[i].title != 'Home' && this.menu[i].title != 'News') {
        this.filteredMenu.push(this.menu[i]);
      }

    }
  }

  /**
   * Loops through the pages to find a slug containing 'video' and assumes
   * that is the video page we are looking for
   * 
   * @param menuItems pages from the side menu set from myapppresser.com
   */
  setVideoPage(menuItems) {
    if(menuItems) {
      menuItems.forEach(element => {
        if(element.slug && element.slug.indexOf('video') >= 0) {
          this.videoPage = element;
        }
      });
    }
  }

  onSubmit(searchForm: NgForm) {
    this.showSpinner();
    this.stopAllVideos();
    var url = 'https://www.winknews.com/?s=' + encodeURIComponent(this.searchTerm);

    this.openPage({url: url});

    this.closeFooterMenu();
    searchForm.reset();
  }

  onToggleFooterMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    this.toggleFooterMenu();

    console.log("stay on this page!!!");

    return false;
  }

  toggleFooterMenu() {
    if(this.menuOpen)
      this.closeFooterMenu();
    else
      this.openFooterMenu();
  }

  closeFooterMenu() {
    // this.bodyTag.classList.remove('td-menu-mob-open-menu');
    if(this.menuOpen) {
      this.slide();
    }
    this.menuOpen = false;
  }

  openFooterMenu() {

    // jQuery(this.bodyTag).addClass('td-menu-mob-open-menu');

    // this.bodyTag.classList.add('td-menu-mob-open-menu');
    this.slide();
    this.menuOpen = true;
  }

  slide() {

    let $ = jQuery;

    var el = $('.mobile-menu-wrap'),
    curHeight = el.height(),
    autoHeight = el.css('height', 'auto').height(),
    finHeight = $('.mobile-menu-wrap').data('open') == 'true' ? "55px" : autoHeight;

    let status = el.data('open') == 'true' ? 'false' : 'true';

    el.data('open', status);
    el.height(curHeight).animate({height: finHeight}).css('overflow', '');
  }

  openPage(page) {
    this.showSpinner();
    this.stopAllVideos();
    this.closeFooterMenu();
    this.events.publish('openpage', page );
  }

  goToVideos() {
    this.showSpinner();
    this.stopAllVideos();
    this.closeFooterMenu();

    if(this.videoPage)
      this.openPage(this.videoPage);
  }

  goToHome() {
    this.showSpinner();
    this.stopAllVideos();
    this.closeFooterMenu();
    this.openPage({url:'https://www.winknews.com/wink-app-home/', extra_classes:''});
  }

  stopAllVideos() {
    this.events.publish('videostop', null);
  }

  showSpinner() {
    if(!this.loading) {
      this.loading = this.loadingController.create({
          showBackdrop: false,
          dismissOnPageChange: false
      });
    }

    this.loading.present();

    setTimeout(() => {
        this.loading.dismiss();
    }, 2000);
}

}
