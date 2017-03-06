import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header.component';
import { PatientListComponent } from './patients/patient-list/patient-list.component';
import { PatientDetailComponent } from './patients/patient-detail/patient-detail.component';
import { PatientItemComponent } from './patients/patient-list/patient-item.component';
import { PatientService } from './patients/patient.service';
import { PatientsComponent } from './patients/patients.component';
import { routing } from './app.routes';
import { PatientStartComponent } from './patients/patient-start.component';
import { PatientEditComponent } from './patients/patient-edit/patient-edit.component';
import { FooterComponent } from './footer.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    PatientListComponent,
    PatientDetailComponent,
    PatientItemComponent,
    PatientsComponent,
    PatientStartComponent,
    PatientEditComponent,
    FooterComponent,
    AboutComponent,
    ContactComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing,
    ReactiveFormsModule
  ],
  providers: [PatientService],
  bootstrap: [AppComponent]
})
export class AppModule { }
