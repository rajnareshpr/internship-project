import { Component, OnInit, TemplateRef, ElementRef, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProcessInstanceService } from '../../providers/process-instance/process-instance.service';
import { ProcessInstanceTransformService } from '../../providers/process-instance/process-instance-transform.service';
import { Options, LabelType } from 'ng5-slider';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { RouterStateService } from 'src/app/providers/router-state/router-state.service';
import * as _ from 'lodash';
import { SlideInOutAnimation } from '../../animations/animations';
declare const Five9SocialWidget: any;
declare const Persist: any;
declare var gtag;
@Component({
    selector: 'app-display-quote',
    templateUrl: './display-quote.component.html',
  styleUrls: ['./display-quote.component.scss'],
  animations: [SlideInOutAnimation]
  
})

export class DisplayQuoteComponent implements OnInit {
    showInvalidOptionMsg: boolean;
    public defaultSelection = true;
    constructor(
        private route: ActivatedRoute,
        private processInstanceService: ProcessInstanceService,
        public router: Router,
        private modalService: BsModalService,
        private processInstanceTransformService: ProcessInstanceTransformService,
        private routerStateService: RouterStateService) { }


    modalRef: BsModalRef;
    @ViewChild('interestQsModal') modal: ElementRef;
    @ViewChild('ECPopupModal') ecPopupModal: ElementRef;
    @ViewChild('ViewMoreModal') viewMoreModal: ElementRef;
    @ViewChild('ECLinkModal') ECLinkModal: ElementRef;
    @ViewChild('ECExpiryModal') ecExpiryPopupModal: ElementRef; 
  @ViewChild('massiveCertPopup') massiveCertPopupModal: ElementRef;
  @ViewChild('PaymentOptionsModal') paymentOptionsModal: ElementRef;
 
    public isValidInterest = false;
    public coverage;
    public processId;
    public hideSlider = false;
    public selectedCoverage;
    public showECpopup = false;
  public isRcAboveLimit = false;
  public isNFIPAvailable = false;
  public animationState = 'out';
  public openFiltersDropdown = false;
  public noOfPages = [];
  public unFinishedGarage = false;
  public selectedOption;

    sliderDeductibleValue = 0;
    sliderDeductableValueMobile = 0;
    propertyValueMobile: number;
    propertyValue: number;

    deductibleOptions: Options = {
        floor: 1000,
        ceil: 10000,
        stepsArray: [
            { value: 1000 },
            { value: 2000 },
            { value: 5000 },
            { value: 10000 },
        ],
        translate: (value: number, label: LabelType): string => {
            switch (label) {
                case LabelType.Floor:
                    return '<b>Lower</b>';
                case LabelType.Ceil:
                    return '<b>Higher</b> ';
                default:
                    return '$' + value;
            }
        },
        hidePointerLabels: true,
    };
    deductibleOptionsContentsOnly: Options = {
    floor: 1000,
    ceil: 10000,
    translate: (value: number, label: LabelType): string => {
      switch (label) {
        case LabelType.Floor:
          return '<b>Lower</b>';
        case LabelType.Ceil:
          return '<b>Higher</b> ';
        default:
          return '$' + value;
      }
    },
    hidePointerLabels: true,
  };

    public processInstance;
    public quoteType;
    public quoteConfirm = false;
    public userEmail;
    public ecMsgResponse;
    public justLookingMsg = false;
    public isFromReminder = false;
    public updateApi = false;
    public renterMsg = false;
    public interest;
    public showError = false;
    public quote;
    public taskId = 'display-quote';
    public questionaireLink;
    public showSpinner;
    public loadingData : boolean = false;
    public isQualifiedBuyer;
    public deductibleHelpText = 'Building Deductible options may change if you change the Building Coverage amount. Personal Property Deductible options may change if you change the Building Deductible. If you select a $10,000 Building Deductible, the only option for the Personal Property Deductible is $10,000.';
  public isMobile = false;
  public zurichData: any;
    public singleCoverageDetails = {
        buildingCoverage: false,
        buildingDeductible: false,
        personalPropertyCoverage: false,
        personalPropertyDeductible: false,
        buildingLossSettlement: false,
        personalPropertyLossSettlement: false,
        otherStructuresCoverage: false,
        additionalLivingExpense: false,
        ordinance: false,
        waitingPeriod: false,
        deductible: false
  };
  public ecQuestions = {
    sc1: false,
    sc2: false,
    sc3: false,
    sc4:false
  }
  public compTblObject: any;
  public comTblIndex = 0;
  public showComparisonTable = false;
  public ecExpiryDate;
  public ecExpiryPopUp = false;
  public post_firm_hiscox_only = false;
  public quoteNumber;
  public replacementCost;
    ngOnInit(): void {
    
        this.route.params.subscribe(params => {
            this.processId = this.route.snapshot.params.processInstanceId;
            this.quoteType = this.route.snapshot.queryParams.type;
            this.isFromReminder = this.route.snapshot.queryParams.getReminder;
            this.updateApi = this.route.snapshot.queryParams.updateApi;

            if (this.route.snapshot.queryParams.latest) {
                this.getLatestPage();
            } else {
                this.getPageInfo();

            }
        });
      this.checkDevice();
      
    }

    @HostListener('window:resize', ['$event'])
    onResize(event?) {
        this.checkDevice();
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

    getLatestPage() {
        this.showSpinner = true;
        this.processInstanceService.getProcessInstanceById(this.processId)
            .then(res => {
                this.showSpinner = false;
                const route = this.processInstanceTransformService.redirectTo([res]);
                // navigate to another page only if latest page is different from current one
                if (this.router.url.split('?')[0].trim() !== route.trim()) {
                    this.router.navigateByUrl(route);
                } else {
                    this.getPageInfo();
                }
            });
    }

    getHelpText(helpTextObject,prop) {
        return helpTextObject[prop];
    }

    getPageInfo() {
        this.showSpinner = true;

        this.processInstanceService.getProcessInstanceByPage(this.processId, 'display-quote', this.isFromReminder, this.updateApi)
            .then(res => {
                this.showSpinner = false;
                if (!res.status) {
                    this.processInstance = res;
                    this.isRcAboveLimit = this.processInstance.data.q_replacement_cost &&
                        this.processInstance.data.q_replacement_cost.value > 250000 ? true : false;
                    this.quote = res.data.svc_calculate_quote.value;
                    this.ecExpiryDate = this.processInstance?.data?.q_ec_expiry_date?.value;
                    this.quoteNumber = this.processInstance.identifier.quote_id;
                    if (this.processInstance.data && (this.processInstance.data.q_interest_reason
                        || this.processInstance.data.q_interest_reason_renter)) {
                        const interest = this.processInstance.data.q_interest_reason || this.processInstance.data.q_interest_reason_renter;
                        this.isQualifiedBuyer = interest.value === 'Just Looking' ? false : true;
                    }
                  this.ECScenarios();
                  let ecData = res.data.page_elevation_certificate_info?.value;                  
                  if (ecData) {
                    let queryParams = {
                      quoteNumber: this.processInstance.data.svc_  _zone?.value?.quoteNumber,
                      messageId: null,
                      processInstanceId: this.processId
                    }
                    /*
                     * if a qualified user does not choose 'Finished Construction'
                     * in Question No C1 of EC, display only Contact Us button on
                     * NFIP option if Hiscox is available
                     */
                    if (this.isQualifiedBuyer && ecData.TCST != "FC" && res.data.svc_calculate_quote.value.private_  )
                    {
                      this.ecQuestions.sc1 = true;
                     
                    }
                     /*
                     * If a qualified user does not choose 'Finished Construction'
                     * in Question No C1 of EC, display "We should talk" page if
                     * Hiscox is not available
                     */
                    if (this.isQualifiedBuyer && ecData.TCST != "FC" && !res.data.svc_calculate_quote.value.private_  )
                    {
                      this.ecQuestions.sc2 = true;
                     

                      queryParams.messageId = 10;
                      this.contactUsNavigation(queryParams);
                    }
                    /*
                     * If an unqualified user does not choose 'Finished Construction'
                     * in Question No C1 of EC, display only View Details button on
                     * NFIP option if Hiscox is available
                     */
                    if (!this.isQualifiedBuyer && ecData.TCST != "FC" && res.data.svc_calculate_quote.value.private_  )
                    {
                      this.ecQuestions.sc3 = true;
                    }
                    /*
                     * If an unqualified user does not choose 'Finished Construction'
                     * in Question No C1 of EC, display Our Apologies page if Hiscox
                     * is not available
                     */
                    if (!this.isQualifiedBuyer && ecData.TCST != "FC" && !res.data.svc_calculate_quote.value.private_  )
                    {
                      this.ecQuestions.sc4 = true;
                      queryParams.messageId = 18;
                      this.router.navigate(['our-apologies'], {
                        queryParams: queryParams
                      });
                    }
                    
                    
                  }
                    // save policy options and send mail
                    if (res.identifier.email) {
                        this.userEmail = res.identifier.email;
                        this.quoteConfirm = res.data.quoteType && res.data.quoteType.value === 'saveQuote' ? true : false;
                        this.getSaveQuote(this.quoteConfirm);
                    }

                    if (this.quote.nfip || this.quote.private_   || this.quote.zurich) {
                        let transformedCoverage;
                        // nfip transform
                        if (this.quote.nfip) {
                            transformedCoverage =
                                this.processInstanceTransformService.transformNfipCoverageOptions(this.quote.nfip.coverageOptions, this.processInstance, this.isQualifiedBuyer);
                            if(this.processInstance.data.q_building_type.value === 'Single Family' && this.processInstance.data.q_time_in_home.value === 'C' && transformedCoverage.length){
                                transformedCoverage[0].buildingLossSettlement = 'Replacement Cost'
                            }
                        }
                        // private    transform
                        if (this.quote.private_   && this.quote.private_  .quote.length) {
                            const hiscoxCoverage =
                                this.processInstanceTransformService.transformHiscoxCoverageOptions(this.quote.private_  .quote);
                            transformedCoverage = transformedCoverage ? [...transformedCoverage, ...hiscoxCoverage] : hiscoxCoverage;
                            this.sliderDeductibleValue = hiscoxCoverage[0].buildingDeductible;
                            this.sliderDeductableValueMobile = hiscoxCoverage[0].buildingDeductible;
                            if(this.ecMsgResponse != "postFirmECTemplate" && ((this.processInstance.data && this.processInstanceTransformService.isPostFirm(this.processInstance)) || this.ecMsgResponse === "preFirmECTemplateQualifiedInValidDiagram" || this.ecMsgResponse === "preFirmECTemplateUnqualifiedInValidDiagram") && !this.quote.nfip) {
                                this.post_firm_hiscox_only = true;
                                let staticNfip = this.processInstanceTransformService.staticNfipCoverageOptions(this.processInstance)[0]
                                transformedCoverage.unshift(staticNfip)
                                // this.replacementCost = this.processInstance.data.q_replacement_cost_duplicate.value >= 250000 ? 250000 : Math.ceil(this.processInstance.data.q_replacement_cost_duplicate.value/100)*100
                            } else if(this.quote.nfip && this.ecExpiryDate && new Date(this.ecExpiryDate) < new Date('07/31/1999')) {
                                // checking the elevation certificate expiry date is less than 07/31/1999
                                this.ecExpiryPopUp = true;
                            } else if (this.quote.nfip && this.isQualifiedBuyer && res.data.q_elevation_certificate && res.data.q_elevation_certificate.value === 'yes') {
                                    // qualified buyer and qualifies for private and has EC
                                    this.showECpopup = true;
                            } 
                        } 
                        else if (this.processInstance.model_definition_id === 'md_pre_firm_policy') {
                            this.contactUsRedirection()
                        }

                        if(this.quote.zurich) {
                            const zurichCoverage = this.processInstanceTransformService.transformZurichCoverage(this.quote.zurich);
                            transformedCoverage = transformedCoverage ? [...transformedCoverage, ...zurichCoverage] : zurichCoverage
                            if(!this.sliderDeductibleValue && !this.sliderDeductableValueMobile){
                                this.sliderDeductibleValue = zurichCoverage[0].buildingDeductible
                                this.sliderDeductableValueMobile = zurichCoverage[0].buildingDeductible
                            }
                        }

                        this.sliderContentOptions();
                      if (this.isMobile) {
                        this.coverage = transformedCoverage;
                        if(this.coverage.length === 1 && this.processInstance.model_definition_id === 'md_pre_firm_policy')
                            this.sliderDeductableValueMobile = this.coverage[0].buildingDeductible;
                        else if(this.coverage.length > 1){
                            this.sliderDeductableValueMobile = this.coverage[1].buildingDeductible;
                        }
                        this.propertyValueMobile = this.coverage[0].contentsDeductible;
                      }
                      else {
                        this.coverage = (transformedCoverage.length > 1 || (transformedCoverage.length == 1 && this.post_firm_hiscox_only)) ?
                          transformedCoverage : transformedCoverage[0];
                      }
                        if (this.coverage && !this.coverage.length) {
                            this.sliderDeductibleValue = this.coverage.buildingDeductible;
                            this.sliderDeductableValueMobile = this.coverage.buildingDeductible;
                            this.selectedCoverage = this.coverage;
                            this.propertyValue = this.coverage.contentsDeductible;
                        }


                    }
                    else {
                        const transformedCoverage =
                        this.processInstanceTransformService.transformNfipCoverageOptions(this.quote.coverageOptions, this.processInstance, this.isQualifiedBuyer);
                      if (this.isMobile) {
                        this.coverage = transformedCoverage;
                      }
                      else {
                        this.coverage = transformedCoverage.length > 1 ?
                          transformedCoverage : transformedCoverage[0];
                      }
                        if (this.coverage && !this.coverage.length) {
                            this.selectedCoverage = this.coverage;
                            this.propertyValue = this.coverage.contentsDeductible;

                        }
                  }
                    if (this.quote.zurich) {
                        this.updateZurichBilingOptions(this.quote.zurich);
                    }
                  else {
                    this.zurichData = [];
                  }
                    this.checkNFIP();
                } else {
                    // if link expires, route to last buy policy page
                    this.getLatestPage();
                }
              window.scroll(0, 0);
              if (this.coverage && this.coverage.length > 1) {
                for (let option of this.coverage) {
                  option.checked = true;
                }
                this.createComparisonTableObject();
              }
              

            });
    }

    createComparisonTableObject() {
        this.compTblObject = [];
        let filteredCoverage = this.coverage.filter(c => c.checked == true);

        for (let i = this.comTblIndex; i < filteredCoverage.length; i++) {
          if (filteredCoverage[i] && this.compTblObject.length<2) {
            this.compTblObject.push(filteredCoverage[i]);
          }
        }
        let size = filteredCoverage.length <= 2 ? 1 : 1 + filteredCoverage.length - 2; // Math.ceil(filteredCoverage.length / 2)
        this.noOfPages = Array(size).fill(4);
    }

    moveIndex(direction) {
        if (direction == 'f') {
          this.comTblIndex += 1;
          if (this.comTblIndex >= this.noOfPages.length) {
            this.comTblIndex = 0
          }
        }
        else {
          this.comTblIndex -= 1;
          if (this.comTblIndex < 0) {
            this.comTblIndex = this.noOfPages.length-1;
          }
        }

        this.createComparisonTableObject();
    }


    applyFilters() {
        let filteredCoverage = this.coverage.filter(c => c.checked == true);
        if (filteredCoverage.length == 0) {
          this.coverage[0].checked = true;
        }
        else {
          this.createComparisonTableObject();
          this.openFilters();
        }
     }
 
    buyPolicy(option?) {
        this.renterMsg = false;
        this.justLookingMsg = false;
        const interest = this.processInstance.data.q_interest_reason ?
            this.processInstance.data.q_interest_reason.value : this.processInstance.data.q_interest_reason_renter.value;

        // pop if building coverage + current renter
        if (interest === 'Current Renter' && !this.processInstance.data.gty_contents_only_policy?.value) {
            this.renterMsg = true;
            this.openModal(option);
        } else if (interest === 'Just Looking' &&
            !this.processInstance.data.gty_contents_only_policy?.value) {
            this.openModal(option);
            this.justLookingMsg = true;
        } else {
            this.loadingData = true;
            this.saveCoverageChoice(option);
        }
    }

    getSaveQuote(confirmation) {
        if (this.quoteType) {
            const data = { type: this.quoteType };
            this.processInstanceService.saveQuote(this.processId, data)
                .then(res => {
                    this.userEmail = res.identifier.email;
                    this.quoteConfirm = confirmation;
                });
        }
    }

    submitInterest() {
        this.closeModal();
        if (this.processInstance.data.q_interest_reason) {
            this.processInstance.data.q_interest_reason.value = this.interest;
        } else {
            this.processInstance.data.q_interest_reason_renter.value = this.interest;
        }
        this.loadingData = true;
        this.saveCoverageChoice(this.selectedOption);
    }

    validateChoice() {
        // building and contents
        if (!['Current Owner', 'Purchase Pending'].includes(this.interest)) {
            this.showError = true;
            this.isValidInterest = false;
        } else {
            this.showError = false;
            this.isValidInterest = true;
        }
    }

    saveCoverageChoice(option?) { 
        this.processInstance.selected_quote = true;
        this.processInstance.data["isPremiumAgreed"] = false
        this.processInstance.identifier.email = this.userEmail;
        this.processInstance.data.quoteType = {
            value: this.userEmail ? this.quoteType : ''
        };
        this.processInstance.data.svc_calculate_quote.value['selected_quote'] = this.selectedCoverage ? this.selectedCoverage : option;
        this.processInstance.data.svc_calculate_quote.value.selected_quote['selected_quote_number'] = this.processInstance.data.svc_calculate_quote.value.selected_quote.companyName === 'NFIP'? this.processInstance.identifier.quote_id : this.processInstance.data.svc_calculate_quote.value.selected_quote.companyName === 'Zurich' ?  this.processInstance.data.svc_calculate_quote.value.zurich.quoteNumber: this.processInstance.data.svc_calculate_quote.value.private_  .quoteNumber;
        if(this.processInstance.data.q_personal_info){
            this.processInstance.data.q_personal_info.value.send_mail = false;
        }
        this.processInstanceService.saveProcessInstance(this.processId, this.processInstance)
            .then(res => {
                this.showSpinner = false;
                if(res.zurichError) {
                    this.router.navigate(['our-apologies'], { queryParams: { messageId: res.messageId, messageArray: res.zurichMessageString, processInstanceId: this.processId, quoteNumber: res.quoteNumber } })
                }else if(res.apiError){
                    this.router.navigate(['our-apologies'], { queryParams: { messageId: res.messageId, processInstanceId: this.processId, quoteNumber: res.quoteNumber } })
                }else{
                    this.router.navigate(['buy-policy', this.processId, 'personal-info']);
                }
            });
    }

    contactUsRedirection(){
        let queryParams = this.getQueryParams();
        if(this.ecExpiryDate && new Date(this.ecExpiryDate) < new Date('07/31/1999')) {
            if(!_.isEmpty(queryParams) && this.isQualifiedBuyer) {
                this.contactUsNavigation(queryParams);
            } else if(!_.isEmpty(queryParams) && !this.isQualifiedBuyer){
                this.router.navigate(['our-apologies'], {
                    queryParams: queryParams
                });
            }
        }

        if(this.ecMsgResponse === 'postFirmECYesQualified'){
            this.contactUsNavigation(queryParams)
        }
    }

    contactUsNavigation(queryParams){
        this.router.navigate(['contact-us'], {
            queryParams: queryParams
        });
    }

    setSelectedCoverage(option, tabclick) {
            this.defaultSelection = true;
            option.isSelected = !option.isSelected;
            // making coverage selected
            this.coverage.forEach(opt => {

                if (JSON.stringify(opt) !== JSON.stringify(option)) {
                    opt.isSelected = false;
                }
                if (opt.isSelected === true) {
                    this.defaultSelection = false;
                }
            });

            this.selectedCoverage = option.isSelected ? option : null;
            if(this.selectedCoverage) {
                this.singleCoverageDetails = _.mapValues(this.singleCoverageDetails, () => false);
            }
    }

    openModal(option) {
        this.selectedOption = option
        this.interest = this.processInstance.data.q_interest_reason ?
            this.processInstance.data.q_interest_reason.value : this.processInstance.data.q_interest_reason_renter.value;
        this.isValidInterest = false;
        this.modalRef = this.modalService.show(this.modal, { class: 'modal-lg' });
    }

    closeModal(): void {
        this.modalRef.hide();
    }

    openSendQuoteModal(template: TemplateRef<any>) {
        this.modalRef = this.modalService.show(template);
    }

    openNoHiscoxMassiveCert() {
        this.modalRef = this.modalService.show(this.massiveCertPopupModal, { class: 'modal-lg' })
    }

    openECModal() {
        if(this.ecExpiryPopUp)
            this.openECExpiryModal();
        else
            this.modalRef = this.modalService.show(this.ecPopupModal, { class: 'modal-lg' });
    }

    openPaymentOptionsModal() {
        this.loadingData = true;
        this.processInstanceService.updateZurichQuote(this.processId,this.processInstance)
        .then(res => {
            this.loadingData = false;
            if(res && res.billingOptions) {
                this.updateZurichBilingOptions(res);
                this.modalRef = this.modalService.show(this.paymentOptionsModal, { class: 'modal-lg' });
            }
        });
    }

    updateZurichBilingOptions(data) {
        this.zurichData = [];
        this.zurichData.push(data.billingOptions.filter(c => c.type == "A1")[0]);
        this.zurichData.push(data.billingOptions.filter(c => c.type == "B1")[0]);
        this.zurichData.push(data.billingOptions.filter(c => c.type == "C1")[0]);
    }

    openMassivecertModal() {
        this.modalRef = this.modalService.show(this.ECLinkModal, { class: 'modal-lg' });
    }

    openECExpiryModal() {
        this.modalRef = this.modalService.show(this.ecExpiryPopupModal, { class: 'modal-lg'})
    }

    addGAEventMS() {
        this.processInstanceService.getProcessInstanceByPage(this.processId, 'display-quote', false, false)
            .then(res => {
                gtag('event', 'ClickedMassiveSearchLink', { event_category: 'ClickEvents' });
            });
    }

    viewMoreDetailsMobile(option) {
        if(option.companyName === 'NFIP' && !this.isQualifiedBuyer && this.ecExpiryPopUp) {
            this.openECExpiryModal();
        } else {
            this.defaultSelection = true;
            option.isSelected = true;
            // making coverage selected
            this.coverage.forEach(opt => {

                if (JSON.stringify(opt) !== JSON.stringify(option)) {
                    opt.isSelected = false;
                }
                if (opt.isSelected === true) {
                    this.defaultSelection = false;
                }
            });
        
            this.selectedCoverage = option.isSelected ? option : null;
            this.modalRef = this.modalService.show(this.viewMoreModal, { class: 'modal-lg modal-dialog-centered' });
        }
    }

    openComparisonTable() {
        window.scroll(0, 0);
        this.showComparisonTable = !this.showComparisonTable;
    }

    openChat() {
        // for qualified buyers
        const options = {
            type: 'chat',
            rootUrl: 'https://app.five9.com/consoles/',
            tenant: 'Wright National    Services',
            title: '  Chat',
            profiles: ['chat_ '],
            showProfiles: true,
            theme: 'default-theme.css',
            state: 'maximized',
            showEmailButton: false
        };

        Five9SocialWidget.removeWidget();
        Five9SocialWidget.addWidget(options);
        Five9SocialWidget.data.state = 'maximized',
            Persist.saveData(Five9SocialWidget.PersistKey, Five9SocialWidget.data);

        Five9SocialWidget.removeWidget();
        Five9SocialWidget.addWidget(options);
        Five9SocialWidget.data.state = 'maximized',
            Persist.saveData(Five9SocialWidget.PersistKey, Five9SocialWidget.data);
    }

    isQuoteSaved(email) {
        this.userEmail = email;
        this.quoteConfirm = true;
    }

    sliderContentEvent(contentsDeductible) {
        let coverageOptions = this.processInstance.data.coverage_options.value.nfip;
        coverageOptions = coverageOptions.filter(opt => {
            return (opt.CONTENTSDEDUCTIBLE === contentsDeductible.toString());
        });
        this.addNfipAdditionalFields(coverageOptions)

        if (this.isMobile){
            this.coverage = [this.processInstanceTransformService.transformNfipCoverageOptions(coverageOptions, this.processInstance, this.isQualifiedBuyer)[0]];
        }
        this.selectedCoverage = this.processInstanceTransformService.transformNfipCoverageOptions(coverageOptions, this.processInstance, this.isQualifiedBuyer)[0];
        this.processInstance.data.q_contents_deductible.value = contentsDeductible
        this.processInstance.data.svc_calculate_quote.value.nfip.coverageOptions = coverageOptions;
        this.processInstance.selected_quote = false;
        this.processInstance.data.slider_changes.value = true;
        this.processInstanceService.saveProcessInstance(this.processId, this.processInstance);
    }

    sliderContentOptions(){
      let coverageOptions = this.processInstance.data.coverage_options.value.nfip;
      let deductibleArray = [];
      _.find(coverageOptions, opt => { deductibleArray.push({value:parseInt(opt.CONTENTSDEDUCTIBLE)}) });
       this.deductibleOptionsContentsOnly["stepsArray"] = deductibleArray
    }

    sliderDeductibleEvent(deductible, processType) {
        let nfipDeductible;
        let nfipCoverageOptions = this.processInstance.data.coverage_options.value.nfip;
        let zurichCoverageOptions = this.processInstance.data.coverage_options.value.zurich;
        if (deductible === 1000) {
            let deductibleArray = [];
            _.find(nfipCoverageOptions, opt => { deductibleArray.push(opt.BUILDINGDEDUCTIBLE) });
            nfipDeductible = Math.min.apply(Math, deductibleArray);
        } else {
            nfipDeductible = deductible;
        }
        if (nfipCoverageOptions && processType === 'md_pre_firm_policy') {
            nfipCoverageOptions = nfipCoverageOptions.filter(opt => {
                return ((opt.BUILDINGDEDUCTIBLE === nfipDeductible.toString())
                    && (opt.CONTENTSDEDUCTIBLE === nfipDeductible.toString()));
            });
        }else{
            nfipCoverageOptions = this.processInstance.data.svc_calculate_quote.value.nfip?.coverageOptions
        }


        if(zurichCoverageOptions){
             zurichCoverageOptions = zurichCoverageOptions.filter(opt => {
                return (parseFloat(opt.deductible) === deductible);
            });
            this.processInstance.data.svc_calculate_quote.value.zurich.deductible = parseFloat(zurichCoverageOptions[0].deductible)
            this.processInstance.data.svc_calculate_quote.value.zurich.totalAmount = parseFloat(zurichCoverageOptions[0].totalAmount)
            this.processInstance.data.zurich_decuctible.value = deductible
            zurichCoverageOptions = this.processInstance.data.svc_calculate_quote.value.zurich
        }


        let hiscoxCoverageOptions = this.processInstance.data.coverage_options.value.private_  ;

        if (hiscoxCoverageOptions) {
            hiscoxCoverageOptions = hiscoxCoverageOptions.filter(opt => {
                return (opt.deductible === deductible && opt.optionName.includes('Value') && !opt.optionName.includes('2% Loss of Use'));
            });
            this.addHiscoxAdditionalFields(hiscoxCoverageOptions);
            this.processInstance.data.hiscox_deductible.value = deductible
            this.processInstance.data.svc_calculate_quote.value.private_  .quote = hiscoxCoverageOptions;
        }

        if (this.coverage.length) {
            //update nfip total amount and deductible
            let transformedCoverage = this.processInstanceTransformService.transformNfipCoverageOptions(nfipCoverageOptions, this.processInstance, this.isQualifiedBuyer);

            //update hiscox total amount and deductible
            transformedCoverage = [...transformedCoverage,
            ...(this.processInstanceTransformService.transformHiscoxCoverageOptions(hiscoxCoverageOptions))];

            //update zurich total amount and deductible
            if (zurichCoverageOptions){
                 transformedCoverage = [...transformedCoverage,
            ...(this.processInstanceTransformService.transformZurichCoverage(zurichCoverageOptions))];
            }

            this.coverage.map((opt => {
                transformedCoverage.find((item => {
                    if(item.companyName === opt.companyName && item.insuranceType === opt.insuranceType){
                        opt.totalAmount = item.totalAmount
                        opt.buildingDeductible = item.buildingDeductible
                        opt.contentsDeductible = item.contentsDeductible
                    }
                }))
            }))
        }

        if (this.selectedCoverage && this.selectedCoverage.companyName === 'NFIP') {
            this.selectedCoverage.buildingDeductible = nfipDeductible;
            this.selectedCoverage.contentsDeductible = nfipDeductible;
            this.selectedCoverage.totalAmount = parseFloat(nfipCoverageOptions[0].TOTALAMOUNT);
        } else if (this.selectedCoverage && this.selectedCoverage.companyName.includes('Hiscox')) {
            this.selectedCoverage.buildingDeductible = deductible;
            this.selectedCoverage.contentsDeductible = deductible;
        } else if(this.coverage[0] && this.coverage[0].companyName === 'NFIP' && this.coverage.length === 1 && this.isMobile){
            this.coverage[0].buildingDeductible = nfipDeductible;
            this.coverage[0].contentsDeductible = nfipDeductible;
            this.coverage[0].totalAmount = parseFloat(nfipCoverageOptions[0].TOTALAMOUNT);
        } else if (this.selectedCoverage && this.selectedCoverage.companyName === 'Zurich') {
            this.selectedCoverage.buildingDeductible = deductible;
            this.selectedCoverage.contentsDeductible = deductible;
            this.selectedCoverage.totalAmount = zurichCoverageOptions.totalAmount;
        } else if(this.coverage && this.coverage.companyName === 'Zurich' && this.coverage.length === 1 && this.isMobile){
            this.coverage.buildingDeductible = deductible;
            this.coverage.contentsDeductible = deductible;
            this.coverage.totalAmount = zurichCoverageOptions.totalAmount;
        }

        if (processType === 'md_pre_firm_policy') {
            this.addNfipAdditionalFields(nfipCoverageOptions)
            this.processInstance.data.q_building_deductible.value = nfipDeductible;
            this.processInstance.data.q_contents_deductible.value = nfipDeductible;
            if (this.processInstance.data.svc_calculate_quote.value.nfip) {
                this.processInstance.data.svc_calculate_quote.value.nfip.coverageOptions = nfipCoverageOptions;
            }
        }

        this.processInstance.selected_quote = false;
        this.processInstance.data.slider_changes.value = true;
        this.processInstanceService.saveProcessInstance(this.processId, this.processInstance);
    }

    addHiscoxAdditionalFields(hiscoxData){
        let data = this.processInstance.data.svc_calculate_quote.value.private_  .quote;
        hiscoxData.map((opt => {
            data.find((item => {
                if (item.optionName.split(" ", 1)[0] === opt.optionName.split(" ", 1)[0]) {
                    opt['contentsCoverage'] = item.contentsCoverage
                    opt['buildingCoverage'] = item.buildingCoverage
                    opt['otherStructures'] = item.otherStructures
                    opt['livingExpense'] = item.livingExpense
                    opt['ordiance'] = item.ordiance
                }
            }))
        }))
        return hiscoxData
    }

    addNfipAdditionalFields(nfipData){
        if (nfipData){
            let data = this.processInstance.data.svc_calculate_quote.value.nfip.coverageOptions[0];
                nfipData[0]['otherStructures'] = data.otherStructures
                nfipData[0]['ordiance'] = data.ordiance
            return nfipData
        }
    }

    goToBackPage(event) {
        if (event) {
            this.processInstanceService.getPreviousTask(this.processId, this.taskId)
                .then(res => {
                    this.router.navigateByUrl(this.processInstanceTransformService.redirectTo(res));
                });
        }
    }

    typeOf(value) {
      return typeof value;
    }

    toggleSingleCoverageDetails(prop) {
        this.singleCoverageDetails[prop] = !this.singleCoverageDetails[prop];
        
        _.forEach(Object.keys(this.singleCoverageDetails), detail => {
            if(detail !== prop) {
                this.singleCoverageDetails[detail] = false;
            }
        })
    }

    openFilters() {
        this.animationState = this.animationState === 'out' ? 'in' : 'out';
    }

    getQueryParams() {
        if(this.processInstance.model_definition_id === 'md_pre_firm_policy') {
            if(this.ecExpiryDate && new Date(this.ecExpiryDate) < new Date('07/31/1999')) {
                let queryParam = { 
                    quoteNumber: this.processInstance.data.svc_  _zone?.value?.quoteNumber,
                    messageId: null,
                    processInstanceId: this.processId
                }

                if(this.isQualifiedBuyer) {
                    queryParam.messageId = 6;
                } else {
                    queryParam.messageId = 14;
                }

                return queryParam;
            } 
            
            if(this.ecMsgResponse === 'postFirmECYesQualified'){
                return {
                    quoteNumber: this.processInstance.data.svc_  _zone?.value?.quoteNumber,
                    messageId: 8,
                    processInstanceId: this.processId
                }
            }
            return {}
        }
    }

    checkECMsgCondition(){
       let   Zones = this.processInstanceTransformService.  Zones();
       let isPostFirm = this.processInstanceTransformService.isPostFirm(this.processInstance)
       if(!isPostFirm &&   Zones.includes(this.processInstance.data.svc_  _zone.value.  Zone) && this.processInstance.data.q_structure_type && this.processInstance.data.q_structure_type.value === "Slab" && this.processInstance.data.q_building_type.value === "Single Family" && this.processInstance.model_definition_id === 'md_pre_firm_policy'){
           return true
       }else{
           return false
       }
    }

    isECCertificateNotExist(){
       if(this.processInstance && this.processInstance.data && this.processInstance.data.q_elevation_certificate && this.processInstance.data.q_elevation_certificate.value === 'no' && this.isQualifiedBuyer && this.checkECMsgCondition()){
           return true
       }else{
           return false
       }
    }

    checkNFIP(){
        if (this.coverage.companyName){
            this.isNFIPAvailable = true
        }else{
            let companyNameArray = []
            companyNameArray = this.coverage.map(opt => {
                return opt.companyName
            });
            this.isNFIPAvailable = companyNameArray.includes('NFIP')? true : false
        }
    }

    ECScenarios(){
        this.ecMsgResponse = this.processInstanceTransformService.ECMsgScenarios(this.processInstance, this.isQualifiedBuyer)
    }

    isPostFirm() {
        let   _zones = ['AE', 'AH']
        let yr_of_construction = this.processInstance.data.q_yr_of_contruction.value;
        let firm_date = this.processInstance.data.svc_  _zone.value.firmDate;
        let   _zone = this.processInstance.data.svc_  _zone.value.  Zone;

        return yr_of_construction >= new Date(firm_date).getFullYear() && (  _zones.includes(  _zone) || (  _zone >= 'A1' &&   _zone <= 'A30'))
    }
}
