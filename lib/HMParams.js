// The doctor can be either BUSY treating a patient, or IDLE, waiting for a patient 
var DOCTOR = 0;
var RECEPTIONIST = 1;

// There are two types of caregivers in our system: doctors and receptionists
var IDLE = 0;
var BUSY = 1;

//a patient enters the hospital UNTREATED; he or she then is QUEUEING to be treated by a doctor; 
// then INTREATMENT with the doctor; then TREATED;
// When the patient is DISCHARGED he or she leaves the clinic immediately at that point.
const RECEPTION     = 1;            // Reception Area
const INRECEPTION   = 2;            // Visiting a receptionist
const INTRIAGE      = 3;            // Triage Area
const WAITING       = 4;            // Waiting Area
const INTREATMENT   = 5;            // Treatment Room with Doctor
const INPHARMACY    = 6;            // Pharmacy collecting medicines
const INEMERGENCY   = 7;            // In the emergency room
const INBED         = 8;            // Bed space
const WARDED        = 9;            // Exited to the ward area
const DISCHARGED    = 10;           // Discharged to the exit 
const EXITED        = 11;           // Leaving the vicinity completely

// The probability of a patient arrival needs to be less than the probability of a departure, else an infinite queue will build.
// You also need to allow travel time for patients to move from their seat in the waiting room to get close to the doctor.
// So don't set probDeparture too close to probArrival.
var probArrival = 0.25;

// To manage the queues, we need to keep track of patientIDs.
var nextPatientID_P1 = 0;
var nextPatientID_P2 = 0;
var nextPatientID_P3 = 0;

// TODO change to poisson + SD timing
var probDocTime = 0.05;
var probReceptionTime = 0.15;
var probEmerTime = 0.2;
var probTriage = 0.3
var probPharmacy = 0.6

var probBedWard = 0.14
var probBedHome = 0.75
var probBedStay = 0.11

// Creating Priority for Patients
// Having 3 different priorities, with the P1 being the most major, and P3 being the least
var patientParams = {
    "P1": {
        "prob": 0.05,
        "nextID": 0
    },
    "P2": {
        "prob": 0.25,
        "nextID": 0
    },
    "P3": {
        "prob": 0.6,
        "nextID": 0
    }
};


var numberCaregivers = {
    "receptionist": 3,
    "doctor": {
        "p1": 2,
        "p2": 3,
        "p3": 4
    }
};