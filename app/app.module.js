var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header.component';
import { PatientListComponent } from './patients/patient-list/patient-list.component';
import { PatientDetailComponent } from './patients/patient-detail/patient-detail.component';
import { PatientItemComponent } from './patients/patient-list/patient-item.component';
import { PatientService } from './patients/patient.service';
import { PatientsComponent } from './patients/patients.component';
import { routing } from './app.routes';
var AppModule = (function () {
    function AppModule() {
    }
    return AppModule;
}());
AppModule = __decorate([
    NgModule({
        declarations: [
            AppComponent,
            HeaderComponent,
            PatientListComponent,
            PatientDetailComponent,
            PatientItemComponent,
            PatientsComponent
        ],
        imports: [
            BrowserModule,
            FormsModule,
            HttpModule,
            routing
        ],
        providers: [PatientService],
        bootstrap: [AppComponent]
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=../../../src/app/app.module.js.map