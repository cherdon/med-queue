// Caregivers
var DOCTOR = 0;
var RECEPTIONIST = 1;

// States of caregivers
var IDLE = 0;
var BUSY = 1;

// Patient states (locations)
const RECEPTION     = 1;            // Reception Area
const INRECEPTION   = 2;            // Visiting a receptionist
const TRIAGE        = 3;            // Triage Area
const WAITING       = 4;            // Waiting Area
const INTREATMENT   = 5;            // Treatment Room with Doctor
const PHARMACY      = 6;            // Pharmacy collecting medicines
const INEMERGENCY   = 7;            // In the emergency room
const BED           = 8;            // Bed space
const WARDED        = 9;            // Exited to the ward area
const DISCHARGED    = 10;           // Discharged to the exit 
const EXITED        = 11;           // Leaving the vicinity completely

// Model types
const POISSON = 0;

// Creating Priority for Patients
// Having 3 different priorities, with the P1 being the most major, and P3 being the least
var patientParams = {
    "P1": {
        "prob": 0.05,
        "nextID": 0,
        "statistics": {"name":"Average time in system, P1: ","location":{"row":10*config.maxRows/13,"col":3*config.maxCols/11},"cumulativeValue":0,"count":0,"rejected":0}
    },
    "P2": {
        "prob": 0.15,
        "nextID": 0,
        "statistics": {"name":"Average time in system, P2: ","location":{"row":10*config.maxRows/13 + 2,"col":3*config.maxCols/11},"cumulativeValue":0,"count":0,"rejected":0}
    },
    "P3": {
        "prob": 0.6,
        "nextID": 0,
        "statistics": {"name":"Average time in system, P3: ","location":{"row":10*config.maxRows/13 + 4,"col":3*config.maxCols/11},"cumulativeValue":0,"count":0,"rejected":0}
    }
};

var probabilities = {
    "arrival": 0.15,
    "bedHome": 0.75,
    "bedWard": 0.14,
    "bedStay": 0.11
}

var models = {
    "reception": {
        "name": POISSON,
        "rate": 4
    },
    "triage": {
        "name": POISSON, 
        "rate": 10
    },
    "P2toWard": {
        "name": POISSON,
        "rate": 720
    },
    "P2toStay": {
        "name": POISSON,
        "rate": 120
    },
    "doctorP1": {
        "name": POISSON,
        "rate": 120
    },
    "doctorP2": {
        "name": POISSON,
        "rate": 720
    },
    "doctorP3": {
        "name": POISSON,
        "rate": 20
    },
    "pharmacy": {
        "name": POISSON,
        "rate": 15
    }
}

caregiverParams = {
    "receptionists": {
        "number": 3
    },
    "doctors": {
        "p1": {
            "number": 2
        },
        "p2": {
            "number": 3
        },
        "p3": {
            "number": 5
        }
    }
}

var max_space = {
    "Waiting_Area" : 20,
    "Bed_Space"    : 60
}
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
