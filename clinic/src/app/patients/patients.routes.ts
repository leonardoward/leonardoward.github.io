import { Routes } from "@angular/router";
import { RouterModule } from "@angular/router";
import { PatientDetailComponent } from "./patient-detail/patient-detail.component";
import { PatientStartComponent } from "./patient-start.component";
import { PatientEditComponent } from "./patient-edit/patient-edit.component";

export const PATIENT_ROUTES:Routes=[
  {path:'', component: PatientStartComponent},
  {path:'new', component: PatientEditComponent},
  {path:':id', component: PatientDetailComponent},
  {path:':id/edit', component: PatientEditComponent}
];
