import { RouterModule } from "@angular/router";
import { PatientsComponent } from "./patients/patients.component";
import { PATIENT_ROUTES } from "./patients/patients.routes";
var APP_ROUTES_PROVIDERS = [
    { path: '', redirectTo: '/patients', pathMatch: 'full' },
    { path: 'patients', component: PatientsComponent, children: PATIENT_ROUTES },
];
export var routing = RouterModule.forRoot(APP_ROUTES_PROVIDERS);
//# sourceMappingURL=../../../src/app/app.routes.js.map