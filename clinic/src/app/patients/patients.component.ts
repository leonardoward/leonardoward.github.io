import { Component, OnInit } from '@angular/core';

import { Patient } from './patient';

@Component({
  selector: 'cl-patients',
  templateUrl: './patients.component.html',
  styles: []
})
export class PatientsComponent implements OnInit {
  selectedPatient: Patient;
  constructor() { }

  ngOnInit() {
  }

}
