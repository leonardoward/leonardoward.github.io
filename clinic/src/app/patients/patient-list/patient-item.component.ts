import { Component, Input } from '@angular/core';

import { Patient } from "../patient";

@Component({
  selector: 'cl-patient-item',
  templateUrl: './patient-item.component.html',
  styles: []
})
export class PatientItemComponent {
  @Input() patient:Patient;	    //Patient
  @Input() patientId:number;			//Patient number
  constructor() { }

}
