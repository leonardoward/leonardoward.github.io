import { Component, OnInit, OnDestroy, AfterContentChecked } from '@angular/core';
import { Router,ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs/Rx";
import { PatientService } from "../patient.service";
import { Patient } from "../patient";

@Component({
  selector: 'cl-patient-detail',
  templateUrl: './patient-detail.component.html',
  styles: []
})
export class PatientDetailComponent implements OnInit,OnDestroy,AfterContentChecked {
  selectedPatient: Patient;
  patientIsSelected:boolean=false;
  private patientIndex:number;
  private subscription:Subscription;
  constructor(private router:Router,
              private route:ActivatedRoute,
              private patientsService:PatientService) { }

  ngOnInit() {
    this.subscription=this.route.params.subscribe(
      (params:any)=>{
        this.patientIndex=params['id'];
        this.selectedPatient = this.patientsService.getPatient(this.patientIndex);
      }
    );
  }

  ngAfterContentChecked(){
    if(this.selectedPatient!=null){
      this.patientIsSelected=true;
    }
  }

  onEdit(){
    this.router.navigate(['/patients',this.patientIndex,'edit']);
  }

  onDelete(){
    this.patientsService.deletePatient(this.selectedPatient);
    this.router.navigate(['/patients']);
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }
}
