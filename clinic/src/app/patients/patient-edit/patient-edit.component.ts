import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormArray,FormGroup,FormControl,Validators, FormBuilder } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs/Rx";
import { Patient } from "../patient";
import { PatientService } from "../patient.service";
import { Router } from "@angular/router";

@Component({
  selector: 'cl-patient-edit',
  templateUrl: './patient-edit.component.html',
  styles: []
})
export class PatientEditComponent implements OnInit, OnDestroy {
  patientForm : FormGroup;
  private patientIndex:number;
  private patient:Patient;
  private isNew:boolean = true;
  private subscription: Subscription;

  constructor(private route:ActivatedRoute,
              private patientService:PatientService,
              private formBuilder: FormBuilder,
              private router:Router) { }

  ngOnInit() {
    this.isNew=true;
    this.subscription=this.route.params.subscribe(
      (params:any)=> {
        if(params.hasOwnProperty('id')){
          this.isNew=false;
          this.patientIndex= + params['id'];
          this.patient=this.patientService.getPatient(this.patientIndex);
        }else{
          this.isNew=true;
          this.patient=null;
        }
        this.initForm();
      }
    );
  }

  onSubmit(){
    const newPatient = this.patientForm.value;
    if(this.isNew){
      this.patientService.addPatient(newPatient);
    }else{
      this.patientService.editPatient(this.patient,newPatient);
    }
    this.navigateBack();
  }

  onCancel(){
    this.navigateBack();
  }

  onAddCondition(name:string){
    (<FormArray>this.patientForm.controls['medicalConditions']).push(
      new FormGroup({
        name: new FormControl(name, Validators.required),
      })
    );
  }

  onRemoveCondition(index:number){
    (<FormArray>this.patientForm.controls['medicalConditions']).removeAt(index);
  }

  private navigateBack(){
    this.router.navigate(['../']);
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

  private initForm(){
    let patientName='';
    let patientAge=0;
    let patientBirthday={day:0,month:0,year:0};
    let patientImageUrl='';
    let patientReferredBy="";
    let patientEmail="";
    let patientTelephone="";
    let patientPhysician="";
    let patientLasPhysical={day:0,month:0,year:0};
    let patientMedicalConditions:FormArray=new FormArray([]);
    if(!this.isNew){
      for(let i=0;i<this.patient.medicalCondition.length;i++){
        patientMedicalConditions.push(
          new FormGroup({
            name: new FormControl(this.patient.medicalCondition[i].name, Validators.required),
          })
        );
      }
      patientName = this.patient.name;
      patientAge = this.patient.age;
      patientBirthday = this.patient.birthday;
      patientImageUrl = this.patient.imagePath;
      patientReferredBy = this.patient.referredBy;
      patientEmail = this.patient.email;
      patientTelephone = this.patient.telephone;
      patientPhysician = this.patient.physician;
      patientLasPhysical = this.patient.lastPhysical;
    }
    this.patientForm = this.formBuilder.group({
      name : [patientName,Validators.required],
      age : [patientAge,Validators.required],
      birthday : [patientBirthday,Validators.required],
      imagePath : [patientImageUrl,Validators.required],
      referredBy : [patientReferredBy,Validators.required],
      email : [patientEmail,Validators.required],
      telephone : [patientTelephone,Validators.required],
      physician : [patientPhysician,Validators.required],
      lastPhysical : [patientLasPhysical,Validators.required],
      medicalConditions: patientMedicalConditions
    });
  }
}

/*
public name:string,
public age:number,
public birthday:{day:number,month:number,year:number},
public imagePath:string,
public referredBy:string,
public email:string,
public telephone:string,
public physician:string,
public lastPhysical:{day:number,month:number,year:number},
public medicalCondition: MedicCondition[]){}
*/
