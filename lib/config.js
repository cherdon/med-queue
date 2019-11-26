var config = {
    // Images
    "patientP1Image"    : "images/patient_p1.png",
    "patientP2Image"    : "images/patient_p2.png",
    "patientP3Image"    : "images/patient_p3.png",
    "doctorImage"       : "images/Doctor_Female.png",
    "receptionistImage" : "images/receptionist-icon.png",

    // Window settings
    "maxCols"           : 50,
    "maxRows"           : 40,
    "cellWidth"         : NaN, //cellWidth is calculated in the redrawWindow function
    "cellHeight"        : NaN, //cellHeight is calculated in the redrawWindow function
    "surface"           : NaN, // Set in the redrawWindow function. It is the D3 selection of the svg drawing surface
    "simTimer"          : NaN, // Set in the initialization function
    "isRunning"         : false, // used in simStep and toggleSimStep
    "animationDelay"    : 200, //controls simulation and transition speed
    "WINDOWBORDERSIZE"  : 10,
    "HUGE"              : 999999, //Sometimes useful when testing for big or small numbers
};

var visual = {
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

for (i = 1; i <= numberCaregivers.doctor.p3; i++){
    var newTreatmentRoom = {"label": "Treatment Room " + i.toString(), "location": {"row": config.maxRows/10 + (config.maxRows/8)*(i-1), "col": 7*config.maxCols/9},"numRows":2,"numCols":4,"color":"lightblue"}
    var newDoctor = {"type":DOCTOR,"label":"D" + i.toString(),"location":{"row": newTreatmentRoom.location.row + (newTreatmentRoom.numRows/2), "col": newTreatmentRoom.location.col + (newTreatmentRoom.numCols/2) },"state":IDLE}
    visual.areas.push(newTreatmentRoom)
    visual.doctors.push(newDoctor);
}

for (i = 1; i <= numberCaregivers.receptionist; i++){
    var receptionArea = visual.areas[2]
    var newReceptionist = {"type":RECEPTIONIST,"label":"R" + i.toString(),"location":{"row":receptionArea.location.row + (i-1)*3,"col":receptionArea.location.col + receptionArea.numCols + 0.5},"state":IDLE}
    visual.caregivers.push(newReceptionist)
}