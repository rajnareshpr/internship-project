"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testing_1 = require("@angular/core/testing");
var questionnaire_component_1 = require("./questionnaire.component");
describe('QuestionnaireComponent', function () {
    var component;
    var fixture;
    beforeEach(testing_1.async(function () {
        testing_1.TestBed.configureTestingModule({
            declarations: [questionnaire_component_1.QuestionnaireComponent]
        })
            .compileComponents();
    }));
    // test component
    beforeEach(function () {
        fixture = testing_1.TestBed.createComponent(questionnaire_component_1.QuestionnaireComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', function () {
        expect(component).toBeTruthy();
    });
});
//# sourceMappingURL=questionnaire.component.spec.js.map