/// <reference types="@types/googlemaps" />
import { Component, AfterViewInit, ViewChild, ChangeDetectorRef, OnDestroy, NgZone, Inject, OnInit, ElementRef } from '@angular/core';
import { MapsAPILoader, MouseEvent } from '@agm/core';
import { ProcessInstanceService } from '../../providers/process-instance/process-instance.service';
import { } from 'googlemaps';
import { Router, ActivatedRoute } from '@angular/router';
import { CarouselConfig } from 'ngx-bootstrap/carousel';
import { HostListener } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { states } from '../../constants/us-states';
import { statesCodes } from '../../constants/us-states-code';
import { FormGroup, Validators, FormControl } from '@angular/forms';
declare var gtag;

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    providers: [
        { provide: CarouselConfig, useValue: { interval: 1500, noPause: true, showIndicators: true } }
    ]
})

export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
    autocompleteInput: string;
    queryWait: boolean;
    latitude: number;
    longitude: number;
    zoom: number;
    public address;
    public selectedAddress;
    public infotext = 'The Quick & Easy Way To';
    public infotext2 = 'Reason To Choose Us';
    public showErrorMessage = false;
    public showErrorMessage1 = false;
    public address1;
    public states = states;
    public statesCodes = statesCodes;
    public selectedAddress1;
    public realtorHome = false;
    public geoaddress;
    private geoCoder;
    public screenHeight;
    public screenWidth;
    public carousalItemsize;
    public isCollapsed = true;
    public activeSlide = 0;
    public modalRef: BsModalRef;
    public noResults;
    public formattedGoogleAddress;
    public addressForm: FormGroup;
    public addressType = null;
    public isMobile = false;
    @ViewChild('addresstext') addresstext: any;
    @ViewChild('addresstext1') addresstext1: any;
    @ViewChild('addressModal') addressModal: ElementRef;
    @HostListener('window:resize', ['$event'])
    onResize(event?) {
        this.carousalItemSizer();
        this.checkDevice();
    }

    constructor(
        public processInstanceService: ProcessInstanceService,
        public router: Router,
        private route: ActivatedRoute,
        private changeDetectorRef: ChangeDetectorRef,
        @Inject(DOCUMENT) private document: Document, private mapsAPILoader: MapsAPILoader,
        private ngZone: NgZone,
        private modalService: BsModalService) { }

    ngOnInit() {
        window.scrollTo(0, 0);
        this.route.queryParams.subscribe(params => {
            if (Object.keys(params).length === 0) {
                this.realtorHome = false;
            } else {
                this.realtorHome = true;
            }
        }); 
        this.carousalItemSizer();
        this.checkDevice();
    }

    ngAfterViewInit() {
        if (!this.realtorHome) {
            this.getPlaceAutocomplete();
            this.getAddressByMap();
        }
    }

    onSwipe(evt) {
        const x = Math.abs(evt.deltaX) > 40 ? (evt.deltaX > 0 ? 'right' : 'left') : '';
        const y = Math.abs(evt.deltaY) > 40 ? (evt.deltaY > 0 ? 'down' : 'up') : '';
        let maxIndex = 0;
        if (this.carousalItemsize == 3) {
            maxIndex = 5
        }
        else {
            maxIndex = 1;
        }
        if (x === "left") {
            if (this.activeSlide < maxIndex) {
                this.activeSlide = this.activeSlide + 1;
            }
            else {
                this.activeSlide = 0;
            }
        }
        else if (x === "right") {
            if (this.activeSlide > 0) {
                this.activeSlide = this.activeSlide - 1;
            }
            else {
                this.activeSlide = maxIndex;
            }
        }

    }

    getPlaceAutocomplete() {
        const googleAddresses = new google.maps.places.Autocomplete(this.addresstext.nativeElement,
            {
                componentRestrictions: { country: 'US' },
                types: ['address']  // 'establishment' / 'address' / 'geocode'
            });
        google.maps.event.addListener(googleAddresses, 'place_changed', () => {
            this.selectedAddress = googleAddresses.getPlace();
            this.showErrorMessage = false;
            this.changeDetectorRef.detectChanges();
        });
    }

    checkInput() {
        if (this.selectedAddress && this.address !== this.selectedAddress.formatted_address) {
            this.selectedAddress = null;
        }
        if (this.selectedAddress1 && this.address1 !== this.selectedAddress1.formatted_address) {
            this.selectedAddress1 = null;
        }
    }

    getQuote(flag) {
      this.addressType = flag;
      //gtag('config', 'UA-163774452-2', {
      //  user_id: res.identifier ? res.identifier.quote_id.replace(/\s/g, '') : '',
      //  custom_map: { dimension1: 'MSLinkClick' },
      //  MSLinkClick: res.identifier ? res.identifier.quote_id.replace(/\s/g, '') : ''

      //});
      //gtag('event', 'ClickedMassiveSearchLink', { event_category: 'ClickEvents' });

     

      if (flag === 1) {

        gtag('event', 'GET_QUOTE_TOP_CLICKED', {
          'event_category': 'BUTTON_CLICK',
          'event_label': 'Get Quote Click',
          'value': 'Get Quote button on home Page'
        })
            if (!this.selectedAddress || !this.selectedAddress.geometry) {
                this.getPropertyAddress(this.address, 1);
            } else {
                this.processInstanceService.getQuote()
                    .then(res => {
                        const data = { data: { q_address: { value: this.selectedAddress } } };
                        this.processInstanceService.signalNextProcess(res.process_instance_id, res.task.task_id, data)
                            .then(signalData => {
                                // route to questionaire with process id and task id
                                this.router.navigate(['/get-your-quote', signalData.process_instance_id, 'task', signalData.task_id]);
                            });
                    });
            }
        }
      if (flag === 2) {
        gtag('event', 'GET_QUOTE_BOTTOM_CLICKED', {
          'event_category': 'BUTTON_CLICK',
          'event_label': 'Get Quote Click',
          'value': 'Get Quote button on home Page'
        })
            if (!this.selectedAddress1) {
                this.showErrorMessage1 = true;
                this.getPropertyAddress(this.address1, 2);
            } else {
                this.processInstanceService.getQuote()
                    .then(res => {
                        const data = { data: { q_address: { value: this.selectedAddress1 } } };
                        this.processInstanceService.signalNextProcess(res.process_instance_id, res.task.task_id, data)
                            .then((res) => {
                                // route to questionaire with process id and task id
                                this.router.navigate(['/get-your-quote', res.process_instance_id, 'task', res.task_id]);
                            });
                    });
            }
        }
    }

    getPropertyAddress(address, flag) {
        // call geocode API to get suggestion
        this.addressForm = new FormGroup({
            address1: new FormControl('', [Validators.required]),
            address2: new FormControl('', [Validators.required]),
            state: new FormControl('', [Validators.required]),
            city: new FormControl('', [Validators.required]),
            zipCode: new FormControl('', [Validators.required])
        });
        this.addressType = null;

        const setErrorMessage = () => {
            if (flag === 1) {
                this.showErrorMessage = true;
            } else {
                this.showErrorMessage1 = true;
            }
        }
        if (address) {
            this.addressForm.disable();
            this.processInstanceService.geoCode(address)
                .then(res => {
                    if (res.results.length) {
                        this.modalRef = this.modalService.show(this.addressModal);
                        this.formattedGoogleAddress = res.results[0];
                    } else {
                        setErrorMessage();
                    }
                });
        } else {
            setErrorMessage();
        }

    }

    setAddressType(type) {
        this.addressType = type;
        if (type === 1) {
            this.addressForm.disable();
            this.addressForm.reset();
            this.selectedAddress = this.formattedGoogleAddress;
            this.selectedAddress.geometry = 'nill';
        } else {
            this.addressForm.enable();
            this.addressForm.reset();
        }
    }

    submitAddress() {
        this.modalRef.hide();
        if (this.addressForm.enabled) {
            this.selectedAddress = {};
            this.selectedAddress.geometry = '1';
            this.selectedAddress.propertyAddress = this.addressForm.getRawValue();
            this.selectedAddress.propertyAddress.state = this.statesCodes[this.selectedAddress.propertyAddress.state];
            this.selectedAddress.propertyAddress.zipcode = this.selectedAddress.propertyAddress.zipCode;
            delete this.selectedAddress.propertyAddress.zipCode;
            this.selectedAddress.formatted_address = this.selectedAddress.propertyAddress.address1 + ', '
                + this.selectedAddress.propertyAddress.address2 + ', ' + this.selectedAddress.propertyAddress.city + ', '
                + this.selectedAddress.propertyAddress.state + ', ' + this.selectedAddress.propertyAddress.zipcode + ' US';
        } else {
            this.selectedAddress = this.formattedGoogleAddress;
            this.selectedAddress.geometry = 'nill';
        }
        this.addressForm.reset();
        this.getQuote(1);
    }

    closeAddressModal(){
        this.modalRef.hide();
        this.addressType = null;
        this.addressForm.reset();
        this.selectedAddress = null;
    }

    stateNoResults(event) {
        this.noResults = event;
        if (event) {
            this.addressForm.controls.state.setErrors({ required: true });
        } else if (!this.states.includes(this.addressForm.get('state').value)) {
            this.addressForm.controls.state.setErrors({ required: true });
            this.noResults = true;
        } else {
            this.addressForm.get('state').setErrors(null);
        }
    }

  getRetrieveQuote(flag) {
    if (flag === 1) {
      gtag('event', 'RETRIEVE_QUOTE_CLICKED', {
        'event_category': 'RETRIEVE_QUOTE_BUTTON_CLICK',
        'event_label': 'RETRIEVE QUOTE Click',
        'value': 'Retrieve Quote button on home Page'
      })
    }
      this.router.navigate(['/retrieve-quote']);
    }

    carousalItemSizer() {
        this.screenHeight = window.innerHeight;
        this.screenWidth = window.innerWidth;
        this.carousalItemsize = 1;

        if (this.screenWidth > 576) {
            this.carousalItemsize = 1;
        }
        else {
            this.carousalItemsize = 3;
        }
    }

    getAddressByMap() {
        this.mapsAPILoader.load().then(() => {
            this.setDefaultLocation();
            this.geoCoder = new google.maps.Geocoder;
            const googleAddresses1 = new google.maps.places.Autocomplete(this.addresstext1.nativeElement,
                {
                    componentRestrictions: { country: 'US' },
                    types: ['address']  // 'establishment' / 'address' / 'geocode'
                });

            google.maps.event.addListener(googleAddresses1, 'place_changed', () => {
                this.selectedAddress1 = googleAddresses1.getPlace();
                this.showErrorMessage1 = false;
                this.changeDetectorRef.detectChanges();
                this.ngZone.run(() => {
                    const place: google.maps.places.PlaceResult = googleAddresses1.getPlace();
                    if (place.geometry === undefined || place.geometry === null) {
                        return;
                    }
                    // set latitude, longitude and zoom
                    this.latitude = place.geometry.location.lat();
                    this.longitude = place.geometry.location.lng();
                    this.zoom = 12;
                });
            });
        });
    }

    private setDefaultLocation() {
        navigator.geolocation.getCurrentPosition((position) => {
            this.latitude = position.coords.latitude;
            this.longitude = position.coords.longitude;
            this.zoom = 8;
            this.getDropPinAddress(this.latitude, this.longitude);
        });
    }

    markerDragEnd($event: MouseEvent) {
        this.latitude = $event.coords.lat;
        this.longitude = $event.coords.lng;
        this.getDropPinAddress(this.latitude, this.longitude);
    }

    placeMarker(event) {
        this.latitude = event.coords.lat;
        this.longitude = event.coords.lng;
        this.getDropPinAddress(this.latitude, this.longitude);
    }

    getDropPinAddress(latitude, longitude) {
        this.geoCoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
            if (status === 'OK') {
                if (results[0]) {
                    this.zoom = 12;
                    this.geoaddress = results[0].formatted_address;
                    this.address1 = this.geoaddress;
                    this.selectedAddress1 = results[0];
                } else {
                    window.alert('No results found');
                }
            } else {
                window.alert('Geocoder failed due to: ' + status);
            }

        });
    }

    checkDevice() {
        const screenHeight = window.innerHeight;
        const screenWidth = window.innerWidth;
        let prev = this.isMobile;
        if (screenWidth > 576) {
          this.isMobile = false;
        }
        else {
          this.isMobile = true;
        }
    }

    ngOnDestroy() {
        this.changeDetectorRef.detach();
    }
}
