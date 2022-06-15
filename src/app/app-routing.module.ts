import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { QuestionnaireComponent } from './pages/questionnaire/questionnaire.component';
import { DisplayQuoteComponent } from './pages/display-quote/display-quote.component';
import { BuyPolicyComponent } from './pages/buy-policy/buy-policy.component';
import { RetrieveQuoteComponent } from './pages/retrieve-quote/retrieve-quote.component';
import { EcType99Component } from './components/elevation-certificates/ec-type99/ec-type99.component';
import { EcType02Component } from './components/elevation-certificates/ec-type02/ec-type02.component';
import { EcType09Component } from './components/elevation-certificates/ec-type09/ec-type09.component';
import { EcType12Component } from './components/elevation-certificates/ec-type12/ec-type12.component';
import { EcType18Component } from './components/elevation-certificates/ec-type18/ec-type18.component';
import { EcType05Component } from './components/elevation-certificates/ec-type05/ec-type05.component';
import { EcType22Component } from './components/elevation-certificates/ec-type22/ec-type22.component';
import { EcType84Component } from './components/elevation-certificates/ec-type84/ec-type84.component';
import { EcType93Component } from './components/elevation-certificates/ec-type93/ec-type93.component';

const routes: Routes = [{
    path: '', redirectTo: 'home',
    pathMatch: 'full'
}, {
    path: 'home',
    component: HomeComponent
}, {
    path: 'retrieve-quote',
    component: RetrieveQuoteComponent
}, {
    path: 'get-your-quote/:processInstanceId/task/:taskId',
    component: QuestionnaireComponent
}, {
    path: 'elevation-certificate-type99',
    component: EcType99Component
},{
    path: 'elevation-certificate-type02',
    component: EcType02Component
},{
    path: 'elevation-certificate-type09',
    component: EcType09Component
},{
    path: 'elevation-certificate-type12',
    component: EcType12Component
},{
    path: 'elevation-certificate-type18',
    component: EcType18Component
},{
    path: 'elevation-certificate-type05',
    component: EcType05Component
},{
    path: 'elevation-certificate-type22',
    component: EcType22Component
  }, {
    path: 'elevation-certificate-type93',
    component: EcType93Component
  },
  {
    path: 'elevation-certificate-type84',
    component: EcType84Component
},{
    path: 'buy-policy/:processInstanceId/:pageId',
    component: BuyPolicyComponent,
    resolve: { data: BuyPolicyGuard },
}, {
    path: 'our-apologies',
    component: OurApologiesComponent
}, {
    path: 'contact-us',
    component: ContactUsComponent
}, {
    path: 'thank-you',
    component: ThankYouComponent
}, {
    path: 'quote/:processInstanceId',
    component: DisplayQuoteComponent
}, {
    path: 'not-found',
    component: NotFoundComponent
}, {
    path: 'link-expired',
    component: LinkExpiredComponent
}, {
    path: 'unexpected-error',
    component: ErrorPageComponent
}, {
    path: '**',
    redirectTo: 'not-found'
}];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true, preloadingStrategy: PreloadAllModules, anchorScrolling: 'enabled' })],
    exports: [RouterModule],
    providers: [],
})
export class AppRoutingModule { }
