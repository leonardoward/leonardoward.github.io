var Patient = (function () {
    function Patient(name, age, birthday, imagePath, referredBy, email, telephone, physician, lastPhysical, medicalCondition) {
        this.name = name;
        this.age = age;
        this.birthday = birthday;
        this.imagePath = imagePath;
        this.referredBy = referredBy;
        this.email = email;
        this.telephone = telephone;
        this.physician = physician;
        this.lastPhysical = lastPhysical;
        this.medicalCondition = medicalCondition;
    }
    return Patient;
}());
export { Patient };
//# sourceMappingURL=../../../../src/app/patients/patient.js.map