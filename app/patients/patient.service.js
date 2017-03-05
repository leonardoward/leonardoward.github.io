var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
import { Patient } from "./patient";
import { MedicCondition } from "./shared/medicCondition";
var PatientService = (function () {
    function PatientService() {
        this.patients = [
            new Patient('John Doe', 20, { day: 1, month: 1, year: 1990 }, '../../../images/1.png', "Dr. Jack Doe", "johndoe@example.com", "04141112222", "Dr. Jack Doe", { day: 10, month: 10, year: 2000 }, [
                new MedicCondition('Diabetes'),
                new MedicCondition('Heart Condition')
            ]),
            new Patient('Jane Doe', 20, { day: 1, month: 1, year: 1990 }, '../../../images/2.png', "Dr. Jack Doe", "johndoe@example.com", "04141112222", "Dr. Jack Doe", { day: 10, month: 10, year: 2000 }, [
                new MedicCondition('Diabetes'),
                new MedicCondition('Heart Condition')
            ])
        ];
    }
    PatientService.prototype.getPatients = function () {
        return this.patients;
    };
    PatientService.prototype.getPatient = function (id) {
        return this.patients[id];
    };
    PatientService.prototype.deletePatient = function (patient) {
        this.patients.splice(this.patients.indexOf(patient), 1);
    };
    return PatientService;
}());
PatientService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], PatientService);
export { PatientService };
//# sourceMappingURL=../../../../src/app/patients/patient.service.js.map