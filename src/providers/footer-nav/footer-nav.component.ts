import { Component, OnInit } from '@angular/core';
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
    } )


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

  onSubmit(searchForm: NgForm) {
    var url = 'http://www.winknews.com/?s=' + encodeURIComponent(this.searchTerm);

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
    this.events.publish('pushpage', page );
  }

  goToVideos() {

    this.closeFooterMenu();

    this.openPage({
      "title":"Winknews Videos",
      "page_id":"4853",
      "page_type":"html",
      "list_route":null,
      "list_display":null,
      "favorites":null,
      "show_slider":"false",
      "slide_route":null,
      "slug":"video-playlist-template",
      "type":"apppages",
      "url":"https:\/\/myapppresser.com\/winkwebdev\/apppages\/video-playlist-template\/",
      "extra_classes":"",
      "target":"",
      "class":"",
      "parent_id":"0"
    });


  }

}
