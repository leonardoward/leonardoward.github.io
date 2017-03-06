import { Routes } from "@angular/router";
import { RouterModule } from "@angular/router";
import { PatientsComponent } from "./patients/patients.component";
import { PATIENT_ROUTES } from "./patients/patients.routes";
import { AboutComponent } from "./about/about.component";
import { ContactComponent } from "./contact/contact.component";

const APP_ROUTES_PROVIDERS:Routes=[
  {path:'', redirectTo: '/patients', pathMatch:'full'},
  {path:'patients', component: PatientsComponent, children: PATIENT_ROUTES},
  {path:'about', component: AboutComponent},
  {path:'contact', component: ContactComponent},
];

export const routing = RouterModule.forRoot(APP_ROUTES_PROVIDERS);
