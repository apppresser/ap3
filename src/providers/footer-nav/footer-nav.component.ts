import { Component, OnInit, Input } from '@angular/core';
import { Events } from 'ionic-angular';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-footer-nav',
  templateUrl: './footer-nav.component.html'
})
export class FooterNavComponent implements OnInit {

  private bodyTag: any;
  private menuOpen = false;
  public searchTerm: any;
  public videoPage: any[];

  @Input() menu;

  constructor(
    public events: Events,
  ) { }

  ngOnInit() {

    // to add/remove body.class
    this.bodyTag = document.getElementsByTagName('body')[0];

    // Add submit listener to search form
    var searchForm = document.querySelector('.td-search-form');
    console.log(searchForm)
    searchForm.addEventListener('submit',  event =>{
      console.log('FooterNavComponent searchForm submit event', event);
      event.preventDefault();
    } );

    console.log('footer menu', this.menu);
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
    this.stopAllVideos();
    var url = 'https://www.winknews.com/?s=' + encodeURIComponent(this.searchTerm);

    this.openPage({url: url});

    this.closeFooterMenu();
    searchForm.reset();
  }

  onToggleFooterMenu($event) {
    $event.preventDefault();
    this.toggleFooterMenu();
  }

  toggleFooterMenu() {
    if(this.menuOpen)
      this.closeFooterMenu();
    else
      this.openFooterMenu();
  }

  closeFooterMenu() {
    this.bodyTag.classList.remove('td-menu-mob-open-menu');
    this.menuOpen = false;
  }

  openFooterMenu() {
    this.bodyTag.classList.add('td-menu-mob-open-menu');
    this.menuOpen = true;
  }

  openPage(page) {
    this.stopAllVideos();
    this.closeFooterMenu();
    this.events.publish('openpage', page );
  }

  goToVideos() {
    this.stopAllVideos();
    this.closeFooterMenu();

    if(this.videoPage)
      this.openPage(this.videoPage);
  }

  goToNews() {
    this.stopAllVideos();
    this.closeFooterMenu();
    this.openPage({url:'https://www.winknews.com/', extra_classes:''});
  }

  stopAllVideos() {
    this.events.publish('videostop', null);
  }

}
