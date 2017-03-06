import { Injectable } from '@angular/core';

import {Patient} from "./patient";
import {MedicCondition} from "./shared/medicCondition";

@Injectable()
export class PatientService {
  private patients: Patient[]=[
    new Patient('John Doe',
    20,
    {day:1,month:1,year:1990},
    '../../../images/1.png',
    "Dr. Jack Doe",
    "johndoe@example.com",
     "04141112222",
     "Dr. Jack Doe",
     {day:10,month:10,year:2000},[
      new MedicCondition('Diabetes'),
      new MedicCondition('Heart Condition')
    ]),
    new Patient('Jane Doe',
    20,
    {day:1,month:1,year:1990},
    '../../../images/2.png',
    "Dr. Jack Doe",
    "johndoe@example.com",
     "04141112222",
     "Dr. Jack Doe",
     {day:10,month:10,year:2000},[
      new MedicCondition('Diabetes'),
      new MedicCondition('Heart Condition')
    ])
  ];
  constructor() { }
  getPatients(){
    return this.patients;
  }
  getPatient(id:number){
    return this.patients[id];
  }
  deletePatient(patient:Patient){
    this.patients.splice(this.patients.indexOf(patient),1);
  }
  addPatient(patient:Patient){
    this.patients.push(patient);
  }
  editPatient(oldPatient:Patient,newPatient:Patient){
    this.patients[this.patients.indexOf(oldPatient)]=newPatient;
  }
}
