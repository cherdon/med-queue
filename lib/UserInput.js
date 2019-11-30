// This file controls most of the user inputs

// Opens the selected sidebar
function openNav(element) {
    document.getElementById(element).style.width = "250px";
  }

// Closes the selected sidebar
function closeNav(element) {
  		document.getElementById(element).style.width = "0";
    }
    
// resets the visual elements and update them
function resetvisual(){
    visual = {
        "areas": [
            {"label": "Entrance",       "location": {"row": config.maxRows/2,   "col": 1},                      "numRows":4,                    "numCols":1,                "color":"green"},
            {"label": "Exit",           "location": {"row": config.maxRows,     "col": 8*config.maxCols/9},     "numRows":1,                    "numCols":4,                "color":"green"},
            {"label": "Reception",      "location": {"row": config.maxRows/10,  "col": config.maxCols/14},      "numRows":config.maxRows/6,     "numCols":config.maxCols/7, "color":"pink"},
            {"label": "Triage",         "location": {"row": config.maxRows/10,  "col": 3*config.maxCols/11},    "numRows":config.maxRows/6,     "numCols":config.maxCols/7, "color":"pink"},
            {"label": "Waiting Area",   "location": {"row": config.maxRows/12,  "col": config.maxCols/2},       "numRows":10,                   "numCols":8,                "color":"pink"},
            {"label": "Bed Space",      "location": {"row": 5*config.maxRows/9, "col": 2*config.maxCols/5},     "numRows":5,                    "numCols":11,               "color":"lightblue"},
            {"label": "Emergency",      "location": {"row": 2*config.maxRows/3, "col": config.maxCols/8},       "numRows":config.maxRows/11,    "numCols":4,                "color":"yellow"},
            {"label": "Pharmacy",       "location": {"row": 7*config.maxRows/9, "col":5*config.maxCols/7},      "numRows":3,                    "numCols":10,               "color":"pink"},
            {"label": "Wards",          "location": {"row": config.maxRows,     "col": config.maxCols/8},       "numRows":1,                    "numCols":4,                "color":"green"}
        ],
        "doctors": [],
        "caregivers": []
    };

    for (i = 1; i <= caregiverParams.doctors.p3.number; i++){
        var newTreatmentRoom = {"label": "Treatment Room " + i.toString(), "location": {"row": config.maxRows/10 + (config.maxRows/8)*(i-1), "col": 7*config.maxCols/9},"numRows":2,"numCols":4,"color":"lightblue"}
        var newDoctor = {"type":DOCTOR,"label":"D" + i.toString(),"location":{"row": newTreatmentRoom.location.row + (newTreatmentRoom.numRows/2), "col": newTreatmentRoom.location.col + (newTreatmentRoom.numCols/2) },"state":IDLE}
        visual.areas.push(newTreatmentRoom)
        visual.doctors.push(newDoctor);
    }
    
    for (i = 1; i <= caregiverParams.receptionists.number; i++){
        var receptionArea = visual.areas[2]
        var newReceptionist = {"type":RECEPTIONIST,"label":"R" + i.toString(),"location":{"row":receptionArea.location.row + (i-1)*3,"col":receptionArea.location.col + receptionArea.numCols + 0.5},"state":IDLE}
        visual.caregivers.push(newReceptionist)
    }
}

// function for changing the number of caregivers with user input
function ChangeCaregivers(){
    //var doc1 = parseInt(document.getElementById("numdoctor1").value);
    //var doc2 = parseInt(document.getElementById("numdoctor2").value);
    var doc3 = parseInt(document.getElementById("numdoctor3").value);
    var reception1 = parseInt(document.getElementById("numreception").value);
    var temp_array = [doc3,reception1];
    for (var i = 0;i < temp_array.length; i++){
        if (isNaN(temp_array[i]) || temp_array[i] <= 0 || temp_array[i] > 5 ){
            temp_array[i] = 1;
        }
    }
    
    //caregiverParams.doctors.p1.number = temp_array[0];
    //caregiverParams.doctors.p2.number = temp_array[1];
    caregiverParams.doctors.p3.number = temp_array[0];
    caregiverParams.receptionists.number = temp_array[1];

    resetvisual();
    redrawWindow();
    ShowSnackBar();

}

// function for changing the probabilites with user input
function ChangeProbabilities(){
    var ProbArrival = parseInt(document.getElementById("ProbArrival").value);
    var ProbP1 = parseInt(document.getElementById("ProbP1").value);
    var ProbP2 = parseInt(document.getElementById("ProbP2").value);
    var ProbBedHome = parseInt(document.getElementById("ProbBedHome").value);
    var ProbBedWard = parseInt(document.getElementById("ProbBedWard").value);
    var temp_array = [ProbArrival, ProbP1, ProbP2, ProbBedHome, ProbBedWard];
    var original_prob = [25, 5, 25, 75, 14];

    for (var i = 0; i < temp_array.length; i ++){
        if (isNaN(temp_array[i]) || temp_array[i] < 0 || temp_array[i] > 100 ){
            temp_array[i] = original_prob[i];
        }
    }
    if (temp_array[1] + temp_array[2] > 100){
        temp_array[1] = original_prob[1];
        temp_array[2] = original_prob[2];
    }
    if (temp_array[3] + temp_array[4] > 100){
        temp_array[3] = original_prob[3];
        temp_array[4] = original_prob[4];
    }
    probabilities.arrival = temp_array[0]/100;
    patientParams.P1.prob = temp_array[1]/100;
    patientParams.P2.prob = temp_array[2]/100;
    probabilities.bedHome = temp_array[3]/100;
    probabilities.bedStay = temp_array[4]/100;

    redrawWindow();
    ShowSnackBar();

}

function ChangeService(){
    var ServiceReception = parseInt(document.getElementById("ServiceReception").value);
    var ServiceTriage = parseInt(document.getElementById("ServiceTriage").value);
    var ServiceWard = parseInt(document.getElementById("ServiceReception").value);
    var ServiceStay = parseInt(document.getElementById("ServiceStay").value);
    var ServiceP1 = parseInt(document.getElementById("ServiceP1").value);
    var ServiceP2 = parseInt(document.getElementById("ServiceP2").value);
    var ServiceP3 = parseInt(document.getElementById("ServiceP3").value);
    var ServicePharmacy = parseInt(document.getElementById("ServicePharmacy").value);
    var original_service = [5, 10, 720, 120, 120, 60, 20, 15];
    var temp_array = [ServiceReception, ServiceTriage, ServiceWard, ServiceStay,
                        ServiceP1, ServiceP2, ServiceP3, ServicePharmacy];
    for (var i = 0; i < temp_array.length; i ++){
        if (isNaN(temp_array[i]) || temp_array[i] < 1 || temp_array[i] > 9999 ){
            temp_array[i] = original_service[i];
        }
    }
    console.log(temp_array[6]);
    models.reception.rate = temp_array[0];
    models.triage.rate = temp_array[1];
    models.P2toWard.rate = temp_array[2];
    models.P2toStay.rate = temp_array[3];
    models.doctorP1.rate = temp_array[4];
    models.doctorP2.rate = temp_array[5];
    models.doctorP3.rate = temp_array[6];
    models.pharmacy.rate = temp_array[7];
    redrawWindow();
    ShowSnackBar();
}

function ChangeCaregiversAndClose(){
    ChangeCaregivers();
    closeNav('mySidenav1');
}

function ChangeProbabilitiesAndClose(){
    ChangeProbabilities();
    closeNav('mySidenav2');
}

function ChangeServiceAndClose(){
    ChangeService();
    closeNav('mySidenav3');
}


// to temporarily show a text box when parameters are updated
function ShowSnackBar(){
    var snackbar = document.getElementById("snackbar");
    snackbar.className = "show";
    setTimeout(function(){ snackbar.className = snackbar.className.replace("show", ""); }, 3000);
}