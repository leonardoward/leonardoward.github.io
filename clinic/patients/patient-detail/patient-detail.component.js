var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { PatientService } from "../patient.service";
var PatientDetailComponent = (function () {
    function PatientDetailComponent(router, route, patientsService) {
        this.router = router;
        this.route = route;
        this.patientsService = patientsService;
        this.patientIsSelected = false;
    }
    PatientDetailComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.subscription = this.route.params.subscribe(function (params) {
            _this.patientIndex = params['id'];
            _this.selectedPatient = _this.patientsService.getPatient(_this.patientIndex);
        });
    };
    PatientDetailComponent.prototype.ngAfterContentChecked = function () {
        if (this.selectedPatient != null) {
            this.patientIsSelected = true;
        }
    };
    PatientDetailComponent.prototype.onEdit = function () {
    };
    PatientDetailComponent.prototype.onDelete = function () {
        this.patientsService.deletePatient(this.selectedPatient);
        this.router.navigate(['/recipes']);
    };
    PatientDetailComponent.prototype.ngOnDestroy = function () {
        this.subscription.unsubscribe();
    };
    return PatientDetailComponent;
}());
PatientDetailComponent = __decorate([
    Component({
        selector: 'cl-patient-detail',
        templateUrl: './patient-detail.component.html',
        styles: []
    }),
    __metadata("design:paramtypes", [Router,
        ActivatedRoute,
        PatientService])
], PatientDetailComponent);
export { PatientDetailComponent };
//# sourceMappingURL=../../../../../src/app/patients/patient-detail/patient-detail.component.js.map