import {MedicCondition} from "./shared/medicCondition"

export class Patient {
	constructor(public name:string,
    public age:number,
    public birthday:{day:number,month:number,year:number},
    public imagePath:string,
    public referredBy:string,
    public email:string,
    public telephone:string,
    public physician:string,
    public lastPhysical:{day:number,month:number,year:number},
    public medicalCondition: MedicCondition[]){}
}
