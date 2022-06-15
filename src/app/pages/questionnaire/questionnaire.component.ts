import { Component, OnInit, ElementRef, ViewChild, TemplateRef, OnDestroy, HostListener, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertComponent } from 'ngx-bootstrap/alert/alert.component';
import { emailRegex } from '../../constants/email-regex';
import { ProcessInstanceService } from '../../providers/process-instance/process-instance.service';
import { ProcessInstanceTransformService } from '../../providers/process-instance/process-instance-transform.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { Options, LabelType } from 'ng5-slider';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ViewportScroller } from '@angular/common';
import { formatDate } from '@angular/common';
import { DateValidator } from '../../shared/validators/date-validator';
import * as moment from 'moment';
declare const Five9SocialWidget: any;
declare const Persist: any;
declare let gtag: Function;
@Component({
    selector: 'app-questionnaire',
    templateUrl: './questionnaire.component.html',
    styleUrls: ['./questionnaire.component.scss']
})

export class QuestionnaireComponent implements OnInit, OnDestroy {

    @ViewChild('closeBtn') closeBtn: ElementRef;


    value = 50000;
    sliderOptions: Options = {
        translate: (value: number, label: LabelType): string => {
            return '$' + value.toLocaleString('en');
        }
    };
    public questions: FormGroup;
    public processId: number;
    public taskId: string;
    public quoteType = 'saveQuote';
    public formInfo: any;
    public questionSet;
    public selectedImage;
    public userEmail;
    public quoteConfirm = false;
    public email;
    public showBackBtn = true;
    public emailRegex = emailRegex;
    public modalRef: BsModalRef;
    public coverageOptions: object;
    public years = [];
    public showSpinner = false;
    public timerFlag;
    public timer;
    public routeSubscriber;
    public isQualifiedBuyer;
    public alerts: any[] = [];
    public isMobile = false;
    public next_question_id = null;
    public showProgress = false;
    public apiProgress:number = 0;
    public isEcExpiry = false;
    public EcExpiryDate;
    public processInstanceData;
    constructor(
        private route: ActivatedRoute,
        private processInstanceService: ProcessInstanceService,
        private processInstanceTransformService: ProcessInstanceTransformService,
        private router: Router,
        private modalService: BsModalService,
        private scroller: ViewportScroller) { }

    @HostListener('window:popstate', ['$event'])
    onPopState(event) {
        const taskId = this.route.snapshot.params.taskId;
        if (taskId !== 'qs_type_of_building') {
            this.goToBackPage(true);
        } else {
            this.router.navigate(['/home']);
        }
    }
    @HostListener('window:resize', ['$event'])
    onResize(event?) {
        this.checkDevice();
    }

    ngOnInit(): void {
        this.routeSubscriber = this.route.params.subscribe(params => {
            this.processId = this.route.snapshot.params.processInstanceId;
            this.taskId = this.route.snapshot.params.taskId;
            const queryParam = this.route.snapshot.queryParams;
            this.showBackBtn = this.taskId === 'qs_type_of_building' ? false : true;
        
            this.processInstanceService.getProcessInstanceById(this.processId)
                .then(res => {
                    this.userEmail = res.identifier?.email;
                    this.processInstanceData = res;
                    this.getYear();
                    // if redirected by email
                    if (queryParam.getLatest) {
                        const query = `quote_id=${res.identifier.quote_id.trim()}&address=${res.data.q_address.value.formatted_address.trim()}`;
                        this.processInstanceService.getProcessInstanceData(query)
                            .then((res) => {
                                const route = this.processInstanceTransformService.redirectTo([res]);
                                if (this.router.url.split('?')[0].trim() !== route.trim()) {
                                    this.router.navigateByUrl(this.processInstanceTransformService.redirectTo(res));
                                } else {
                                    return this.processInstanceService.getTaskInfo(this.processId, this.taskId, {});
                                }
                            });
                    } else { 
                        return this.processInstanceService.getTaskInfo(this.processId, this.taskId, {});
                    }
                })
                .then((res) => {
                    if (res && res.view && res.view.redirectTo) {
                        this.router.navigate([res.view.redirectTo], {
                            queryParams: {
                                messageId: res.view.messageId,
                                quoteNumber: res.data.svc_  _zone?.value?.quoteNumber
                            }
                        });
                    }
                    this.formInfo = res;
                    this.showSpinner = false;

                    // if the page is for elevation
                    if(this.taskId === 'page_elevation_certificate') {
                        this.EcExpiryDate = new Date(res.data.q_ec_expiry_date.value);
                    } else {
                      this.EcExpiryDate = null;
                        this.initialiseForm();
                    }
                    window.scroll(0, 0);
                });
        });
        this.checkDevice();
    }

    initialiseForm() {
        const group = {};
        const nonFormTypes = ['display', 'coverage'];
        let formData;
        let validators = [];
      this.coverageOptions = {};
      this.showProgress = false;
        this.questionSet = this.formInfo.question_set;
        if (this.formInfo.data && (this.formInfo.data.q_interest_reason || this.formInfo.data.q_interest_reason_renter)) {
            const interest = this.formInfo.data.q_interest_reason || this.formInfo.data.q_interest_reason_renter;
            this.isQualifiedBuyer = interest.value === 'Just Looking' ? false : true;
        }
        
        if (this.questionSet.length) {
            this.questionSet.forEach(question => {
                validators = [];

                question = this.restictionOnEC(question)
                if (question.question_type === 'slider') {
                    question.options.translate = this.sliderOptions.translate;
                }

                if (!nonFormTypes.includes(question.question_type)) {
                    formData = this.formInfo.data[question.question_id]?.value;

                    // adding validators
                    if (question.validation.required.value) {
                        validators.push(Validators.required);
                    }
                    if (question.validation.min) {
                        validators.push(Validators.min(question.validation.min.value));
                    }
                    if (question.validation.max) {
                        validators.push(Validators.max(question.validation.max.value));
                    }
                    if(question.validation.date_validation?.value === true) {
                        validators.push(DateValidator.validate)
                    }

                    group[question.question_id] = new FormControl({ value: (formData || ''), disabled: question.disabled }, validators);

                } else if (question.question_type === 'coverage') {
                    // For coverage options
                    const questionValues = this.formInfo.data;

                    if (question.question_id === 'q_building_deductible_display') {
                        this.coverageOptions['buildingCoverage'] = questionValues.q_prp_building_coverage?.value || 0;
                        this.coverageOptions['buildingDeductible'] = question.value;

                    } else if (question.question_id === 'q_prp_contents_coverage_display') {
                        this.coverageOptions['contentsCoverage'] = question.value;

                    } else if (question.question_id === 'q_contents_deductible_display') {
                        let contentsCoverage = 0;
                        if (this.coverageOptions['contentsCoverage'] === undefined) {
                            contentsCoverage = questionValues.q_prp_contents_coverage?.value || 0;
                        }

                        this.coverageOptions['contentsCoverage'] = this.coverageOptions['contentsCoverage'] || contentsCoverage;
                        this.coverageOptions['contentsDeductible'] = question.value;
                    }
                }
            });

            this.questions = new FormGroup(group);
        }
        setTimeout(() => {
             this.setfocus(this.next_question_id);
        }, 1);

    }

    checkSecondaryAction(key, flag?) {
        const selectedQuestion = _.find(this.questionSet, qs => qs.question_id === key);
        if (selectedQuestion.action) {
            const taskData = this.processInstanceTransformService.setSignalData(this.questions.getRawValue());
            if (flag) {
                taskData.data[key].change = true;
            }
          const scrollPosition = this.scroller.getScrollPosition();
        
            this.processInstanceService.getTaskInfo(this.processId, this.taskId, taskData)
                .then(res => {
                    this.formInfo = res;
                    let question;
                    for (question of res.question_set) {
                        if (question.name === key) {
                            this.next_question_id = question.next_question_id;
                        }
                    }
                    this.initialiseForm();
                    //setTimeout(() => {
                    //    this.scroller.scrollToPosition(scrollPosition);
                    //}, 1);
                });
        } else {
          this.setfocus(selectedQuestion.next_question_id);
        }
    }



    checkRequired(question) {
        if (question.validation && question.validation.required && question.validation.required.value) {
            return true;
        } else {
            return false;
        }
    }

    checkImageSelected(optionVal, formElem) {
        if (this.questions.get(formElem.question_id).value === optionVal) {
            return true;
        } else {
            return false;
        }
    }

    getNextTask() {
        if (this.questions.valid) {
            if(this.questions.get('q_ec_expiry_date')) {
                let validationResult = DateValidator.validate(this.questions.get('q_ec_expiry_date'));
                if(validationResult && validationResult.dateError === true) {
                    this.questions.get('q_ec_expiry_date').setErrors({ dateError: true })
                    return;
                }
            }
            const taskData = this.processInstanceTransformService.setSignalData(this.questions.getRawValue());
          this.showSpinner = true;
          
          var isViewQuote = this.formInfo['view']['submit']['text']['en'] == "VIEW QUOTE" ? true:false;
          if (isViewQuote) {
            this.showProgress = true;
            this.apiProgress = 0;
            var interval = setInterval(() => {

              this.apiProgress += 5;

              if (this.apiProgress >= 100) {
                clearInterval(interval);
                this.showProgress = false;
              }
            }, 500);
          }
          this.callTaskApi(taskData);
           
        }
        else {
            this.alerts.push({
                type: 'danger',
                msg: `Please answer all the questions to proceed.`,
                timeout: 5000
            });
        }
  }

  callTaskApi(taskData, submitEC: boolean=false) {
    if (submitEC) {     
     
      this.showProgress = true;
      this.showSpinner = true;
      this.apiProgress = 0;
      var interval = setInterval(() => {

        this.apiProgress += 5;

        if (this.apiProgress >= 100) {
          clearInterval(interval);
          this.showProgress = false;
        }
      }, 500);
    }
    this.processInstanceService.signalNextProcess(this.processId, this.taskId, taskData)
      .then(res => {
        this.showProgress = false;
        if (!res.status) { 
          this.quoteConfirm = false;
          if (res.messageId === "12") {
            res.messageId = (taskData.data['q_interest_reason']['value'] == "Just Looking") ? "13" : "12"
          }
          if (res.redirectTo) {
            this.router.navigate([res.redirectTo], {
              queryParams: { messageId: res.messageId, type: 'displayQuote', quoteNumber: res.quoteNumber, processInstanceId: this.processId }
            });
          } else {
            this.router.navigate(['/get-your-quote', res.process_instance_id, 'task', res.task_id]);
          }
        }
      });
  }

    setOption(formElem, option) {
        this.selectedImage = option.value;
        this.next_question_id = formElem.next_question_id;
        this.questions.get(formElem.question_id).setValue(option.value);
        this.checkSecondaryAction(formElem.name, true);

    }

    isQuoteSaved(email) {
        this.userEmail = email;
        this.quoteConfirm = true;
    }

    goToBackPage(event) {
        if (event) {
            this.processInstanceService.getPreviousTask(this.processId, this.taskId)
                .then(res => {
                    this.router.navigateByUrl(this.processInstanceTransformService.redirectTo(res));
                });
        }
    }

    openModal(saveQuoteModal: TemplateRef<any>) {
        this.modalRef = this.modalService.show(saveQuoteModal);
    }

    addGAEventMS() {

        this.processInstanceService.getProcessInstanceByPage(this.processId, 'display-quote', false, false)
            .then(res => {
                //gtag('config', 'UA-163774452-2', {
                //    user_id: res.identifier ? res.identifier.quote_id.replace(/\s/g, '') : '',
                //    custom_map: { dimension1: 'MSLinkClick' },
                //    MSLinkClick: res.identifier ? res.identifier.quote_id.replace(/\s/g, '') : ''

                //});
                gtag('event', 'ClickedMassiveSearchLink', { event_category: 'ClickEvents' });
            });
    }
    checkNumberFieldLength(e: Event, question) {
        // checking maxlength for numbers
        if (question.validation.maxLength) {
            const selectedQuestion = this.questions.get(question.question_id);
            if (selectedQuestion.value) {
                const slicedVal = selectedQuestion.value.toString().slice(0, question.validation.maxLength.value);
                selectedQuestion.setValue(Math.abs(parseInt(slicedVal, 0)));
            }
        }
    }

    getYear() {
        this.years = [];
        const currentYear = new Date().getFullYear();
        let startYear = 1700;

        for (let i = startYear; i <= currentYear; i++) {
            this.years.push(startYear++);
        }
        this.years.reverse(); 
    }

    setYear(questionId, val) {
        this.questions.get(questionId).setValue(val);
        this.questions.get(questionId).markAsTouched();
    }

    dropdownSelect(option, formControlName) {
        this.questions.get(formControlName).setValue(option.toLocaleString('en'));
        this.checkSecondaryAction(formControlName, true)
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

    bSentence(text) {
        const strArr = text.split(' ');
        strArr.pop();
        return strArr.join(' ');
    }

    eSentence(text) {
        const strArr = text.split(' ');
        return strArr.pop().trim();
    }

    checkDevice() {
        const screenHeight = window.innerHeight;
        const screenWidth = window.innerWidth;

        if (screenWidth > 576) {
            this.isMobile = false;
        }
        else {
            this.isMobile = true;
        }
    }

    setfocus(nextElement) {
        if (this.next_question_id != null || nextElement != null) {
            if (nextElement === '') {
                nextElement = 'submit_button';
            }
            const x = document.getElementById(nextElement);
            scrollElementIntoView(x, 'smooth');
        }
        this.next_question_id = null;
    }

    onValueChange(date, question_id) {
        
        if(question_id === 'q_ec_expiry_date' && date) {
            if(date >= new Date('07/31/1999')) {
                this.isEcExpiry = true;
                this.formInfo.view.submit.text.en = 'NEXT';
            } else {
                this.isEcExpiry = false;
                this.formInfo.view.submit.text.en = 'VIEW QUOTE';
            }
            
            let validationresults = DateValidator.validate(this.questions.get(question_id));
            if(!validationresults) {
                this.questions.get(question_id).setValue(date);
            }      
        }
    }

    restictionOnEC(question) {
        let   Zones = this.processInstanceTransformService.  Zones();
        if(this.taskId === 'qs_contents_policy' && question.question_id === 'q_elevation_certificate'){
            if(this.processInstanceData.model_definition_id === 'md_pre_firm_policy' &&   Zones.includes(this.processInstanceData.data.svc_  _zone.value.  Zone)){
                question.disabled = false
            }else
            {
                question.disabled = true
            }
            return question
        }else {
            return question
        }
    }

    ngOnDestroy() {
        if (this.routeSubscriber) {
            this.routeSubscriber.unsubscribe();
        }
    }

    checkECMsgCondition(){
       let   Zones = this.processInstanceTransformService.  Zones();
       let isPostFirm = this.processInstanceTransformService.isPostFirm(this.processInstanceData)
       if(isPostFirm &&   Zones.includes(this.processInstanceData.data.svc_  _zone.value.  Zone) && this.processInstanceData.data.q_structure_type && this.processInstanceData.data.q_structure_type.value === "Slab" && this.processInstanceData.data.q_building_type.value === "Single Family" && this.processInstanceData.model_definition_id === 'md_pre_firm_policy'){
           return true
       }else{
           return false
       }
    }

    isECExpiryBetween(start, end) {
        if(start && end)
            return this.EcExpiryDate >= new Date(start) && this.EcExpiryDate <= new Date(end);
        
        return this.EcExpiryDate >= new Date(start); 
    }
}
export const scrollElementIntoView = (element: HTMLElement, behavior?: 'smooth' | 'instant' | 'auto') => {

    const scrollTop = window.pageYOffset || element.scrollTop;

    // Furthermore, if you have for example a header outside the iframe 
    // you need to factor in its dimensions when calculating the position to scroll to

    const finalOffset = element.getBoundingClientRect().top + scrollTop - 74 - 55;

    window.parent.scrollTo({
        top: finalOffset,
        behavior: 'smooth' || 'auto'
    });
};