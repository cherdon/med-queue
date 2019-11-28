var config = {
    // Images
    "patientP1Image"    : "images/patient_p1.png",
    "patientP2Image"    : "images/patient_p2.png",
    "patientP3Image"    : "images/patient_p3.png",
    "doctorImage"       : "images/Doctor_Female.png",
    "receptionistImage" : "images/receptionist-icon.png",

    // Window settings
    "patientSpeed"      : 1,        // Number of cells per step
    "maxCols"           : 50,
    "maxRows"           : 40,
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