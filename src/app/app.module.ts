// Modules 
import { BrowserModule, HammerModule, HammerGestureConfig, HAMMER_GESTURE_CONFIG  } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { Ng5SliderModule } from 'ng5-slider';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { UiSwitchModule } from 'ngx-ui-switch';
import { AgmCoreModule } from '@agm/core';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { DecimalPipe } from '@angular/common';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { AlertModule } from 'ngx-bootstrap/alert';
import { ProgressBarModule } from "angular-progress-bar";

// Components
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './pages/home/home.component';
import { RealtorHomeComponent } from './pages/realtor-home/realtor-home.component';
import { OrderByPipe } from './pipes/app.custom-pipes';

// Service
import { ProcessInstanceService } from './providers/process-instance/process-instance.service';
import { QuestionnaireComponent } from './pages/questionnaire/questionnaire.component';
import { HeaderComponent } from './components/header/header.component';
import { DisplayQuoteComponent } from './pages/display-quote/display-quote.component';
import { PersonalInfoComponent } from './components/personal-info/personal-info.component';
import { RetrieveQuoteComponent } from './pages/retrieve-quote/retrieve-quote.component';
// Service
import { NumberDirective } from './directives/number.directive';
import { CurrencyDirective } from './directives/currency.directive';
import { FormErrorDirective } from './directives/form-error.directive';
import { HttpInterceptorInterceptor } from './interceptors/http-interceptor.interceptor';
import { HttpClientModule, HTTP_INTERCEPTORS } from '/.angular/common/http';

export class GestureConfig extends HammerGestureConfig {
  overrides = <any>{
    swipe: { direction: Hammer.DIRECTION_HORIZONTAL },
    pinch: { enable: false },
    rotate: { enable: false }
  };
}

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    FooterComponent,
    HomeComponent,
    QuestionnaireComponent,
    HeaderComponent,
    ErrorMessageComponent,
    FormErrorDirective,
    CurrencyDirective,
    PhoneMaskDirective,
    ECNumericDirective,
    DisplayQuoteComponent,
    BuyPolicyComponent,
    PersonalInfoComponent,
    OurApologiesComponent,
    ESignatureComponent,
    SafePipe,
    RetrieveQuoteComponent,
    OurApologiesComponent,
    UnderwritingComponent,
    PaymentInfoComponent,
    ModalComponent,
    NumberDirective,
    LinkExpiredComponent,
    ErrorPageComponent,
    RealtorHomeComponent,
    LetterDirective,
    ContactUsComponent,
    ThankYouComponent,
    OrderByPipe,
    EcType99Component,
    EcType05Component,
    EcType02Component,
    EcType09Component,
    EcType12Component,
    EcType18Component,
    EcType22Component,
    EcType84Component,
    EcType93Component,
    EcInfoPopupComponent,
    EcLinkPopupComponent,
    CongratulationComponent
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    UiSwitchModule,
    Ng5SliderModule,
    TabsModule.forRoot(),
    ButtonsModule.forRoot(),
    PopoverModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TabsModule.forRoot(),
    ReactiveFormsModule,
    BrowserAnimationsModule,
    TypeaheadModule.forRoot(),
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    CollapseModule.forRoot(),
    AlertModule.forRoot(),   
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDVvppTIKfD2arFIvh45-oU41I7426PN14',
      libraries: ['places']
    }),
    HammerModule,
    CarouselModule.forRoot(),
    ProgressBarModule
  ],
  providers: [ProcessInstanceService,
    DecimalPipe,
    RouterStateService,
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: GestureConfig,
    },
    { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorInterceptor, multi: true }],
  exports: [
    PhoneMaskDirective
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
