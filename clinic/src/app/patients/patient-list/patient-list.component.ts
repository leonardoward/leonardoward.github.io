import { Component, OnInit } from '@angular/core';

import { Patient } from "../patient";
import { PatientService } from "../patient.service"

@Component({
  selector: 'cl-patient-list',
  templateUrl: './patient-list.component.html',
  styles: []
})
export class PatientListComponent implements OnInit {
  patients: Patient[]=[];  //Patient's array

  constructor(private patientService:PatientService) { }

  ngOnInit() {
    this.patients=this.patientService.getPatients();
  }

}
