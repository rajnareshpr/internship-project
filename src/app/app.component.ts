import { Component, OnInit } from '@angular/core';
import { RouterStateService } from './providers/router-state/router-state.service';
import { Router, NavigationEnd } from '@angular/router';

import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
declare var gtag;
declare const Five9SocialWidget: any;
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title = '-Ui';

  constructor(private routingState: RouterStateService, public router: Router, private http: HttpClient) {
    this.router.events.subscribe(event =>
    {
          if (event instanceof NavigationEnd)
          {

            this.getJSON().subscribe(data => {              
              var check = null;
              var ori_path = event.urlAfterRedirects;
              for (var key in data)
              {
                // console.log(' name=' + key + ' value=' + data[key]);

               var match = event.urlAfterRedirects.match(key);
                if (match) {                 
                  var page_title = data[key];
                  check = page_title
                  gtag('config', 'UA-163774452-2', {
                    page_path: page_title
                  });
                 
                  //'custom_map': {
                  //  'metric1': 'MassiveSearchLink',
                  //    'dimension2': 'MSLinkClick'
                  //}
                  //gtag('event', 'ClickedMassiveSearchLink', { 'MassiveSearchLink': 12345,'MSLinkClick':6678 });
                  //gtag('event', 'ClickedMassiveSearchLink', { 'ID': '32323232' });
                }               
              }
              if (!check) {
                gtag('config', 'UA-163774452-2', {
                  page_path: ori_path
                });
              }
            });
          }
        });
    }

    ngOnInit() {
        // keep track of routing
      this.routingState.loadRouting();
      
    }

  public getJSON(): Observable<any> {
    return this.http.get("../assets/UrlMapforGAnalytics.json");
  }

    removeChatWidget() {
        Five9SocialWidget.removeWidget();
    }
}
