import { Component, OnInit, ViewChild, ChangeDetectorRef, HostListener, OnDestroy, AfterViewInit } from '@angular/core';
import { } from 'googlemaps';
import { Router } from '@angular/router';
import { ProcessInstanceService } from '../../providers/process-instance/process-instance.service';
import { ProcessInstanceTransformService } from '../../providers/process-instance/process-instance-transform.service';
import { emailRegex } from '../../constants/email-regex';

@Component({
    selector: 'app-retrieve-quote',
    templateUrl: './retrieve-quote.component.html',
    styleUrls: ['./retrieve-quote.component.scss']
})
export class RetrieveQuoteComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('emailAddressText') emailAddressText: any;
    @ViewChild('quoteAddressText') quoteAddressText: any;
    public email;
    public emailAddress;
    public quoteAddress;
    public quote_id;
    public query;
    public selectedAddress;
    public name;
    public emailAddressFocused;
    public emailAddressBlured;
    public quoteAddressFocused;
    public quoteAddressBlured;
    public emailResponse;
    public quoteResponse;
    public redirectMessage = false;
    public IsMobile = false;
    public emailRegex = emailRegex;

    constructor(
        private processInstanceService: ProcessInstanceService,
        public router: Router,
        private changeDetectorRef: ChangeDetectorRef,
        private processInstanceTransformService: ProcessInstanceTransformService) { }

    @HostListener('window:resize', ['$event'])
    onResize(event?) {
        this.AutocompleteSizer();
    }

    ngOnInit(): void {
        this.AutocompleteSizer();
    }

    ngAfterViewInit() {
        this.getPlaceAutocomplete();
    }

    AutocompleteSizer() {
        // if(this.screenWidth >= 1200)
        //  this.carousalItemsize = 1;
        // if(this.screenWidth >= 992)
        //  this.carousalItemsize = 1;
        // if(this.screenWidth >= 768)
        //  this.carousalItemsize = 1;
        if (window.innerWidth > 576) {
            this.IsMobile = false;
        }
        else {
            this.IsMobile = true;
        }
    }

    getPlaceAutocomplete() {
        this.getEmailAddress();
        this.getQuoteAddress();
    }

    getEmailAddress() {
        const emailAddress = new google.maps.places.Autocomplete(this.emailAddressText.nativeElement,
            {
                componentRestrictions: { country: 'US' },
                types: ['address']  // 'establishment' / 'address' / 'geocode'
            });

        google.maps.event.addListener(emailAddress, 'place_changed', () => {
            this.selectedAddress = emailAddress.getPlace();
            this.changeDetectorRef.detectChanges();

        });
    }

    getQuoteAddress() {
        const quoteAddress = new google.maps.places.Autocomplete(this.quoteAddressText.nativeElement,
            {
                componentRestrictions: { country: 'US' },
                types: ['address']  // 'establishment' / 'address' / 'geocode'
            });

        google.maps.event.addListener(quoteAddress, 'place_changed', () => {
            this.selectedAddress = quoteAddress.getPlace();
            this.changeDetectorRef.detectChanges();
        });
    }

    getRetrieveByEmail() {
        const address = this.selectedAddress ? this.selectedAddress.formatted_address : this.emailAddress;
        this.query = `email=${this.email.trim()}&address=${address.trim()}`;
        this.processInstanceService.getProcessInstanceData(this.query)
            .then(res => {
                if (res.error) {
                    this.emailResponse = res.error.message?.title;
                }
                else {
                    this.router.navigateByUrl(this.processInstanceTransformService.redirectTo(res));
                }
            });
    }

    onFocusEmail() {
        this.emailAddressFocused = true;
    }

    onBlurEmail() {
        this.emailAddressBlured = true;
    }

    getRetrieveByQuote() {
        const address = this.selectedAddress ? this.selectedAddress.formatted_address : this.quoteAddress;
        this.query = `quote_id=${this.quote_id.trim()}&address=${address.trim()}`;
        this.processInstanceService.getProcessInstanceData(this.query)
            .then(res => {
                if (res.error) {
                    this.quoteResponse = res.error.message?.title;
                } else {
                    this.router.navigateByUrl(this.processInstanceTransformService.redirectTo(res));
                }
            });
    }

    onFocusQuote() {
        this.quoteAddressFocused = true;
    }

    onBlurQuote() {
        this.quoteAddressBlured = true;
    }

    ngOnDestroy() {
        this.changeDetectorRef.detach();
    }
}
