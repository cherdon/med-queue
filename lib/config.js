var config = {
    // Images
    "patientA": "images/People-Patient-Female-icon.png",
    "patientB": "images/People-Patient-Male-icon.png",
    "doctor1": "images/Doctor_Female.png",
    "doctor2": "images/Doctor_Male.png",
    "receptionist": "images/receptionist-icon.png",

    // Window settings
    "maxCols": 40,
    "cellWidth": NaN, //cellWidth is calculated in the redrawWindow function
    "cellHeight": NaN, //cellHeight is calculated in the redrawWindow function
    "surface": NaN, // Set in the redrawWindow function. It is the D3 selection of the svg drawing surface
    "simTimer": NaN, // Set in the initialization function
    "isRunning": false, // used in simStep and toggleSimStep
    "animationDelay": 200, //controls simulation and transition speed
    "WINDOWBORDERSIZE": 10,
    "HUGE": 999999, //Sometimes useful when testing for big or small numbers

    // Visualise some
    "doctorRow": 10,
    "doctorCol": 20,
    "receptionistRow": 1,
    "receptionistCol": 20
};

var visual = {
    "areas": [
        {"label": "Waiting Area", "startRow":4,"numRows":5,"startCol":15,"numCols":11,"color":"pink"},
        {"label": "Staging Area", "startRow":config.doctorRow-1,"numRows":1,"startCol":config.doctorCol-2,"numCols":5,"color":"red"},
        {"label": "Reception Waiting", "startRow":24,"numRows":2,"startCol":18,"numCols":4,"color":"pink"},
        {"label": "Triage Waiting", "startRow":20,"numRows":2,"startCol":18,"numCols":4,"color":"pink"},
        {"label": "Treatment room", "startRow":2,"numRows":3,"startCol":18,"numCols":4,"color":"pink"},
        {"label": "Treatment waiting", "startRow":8,"numRows":2,"startCol":18,"numCols":4,"color":"pink"},
        {"label": "Pharmacy waiting", "startRow":18,"numRows":3,"startCol":5,"numCols":10,"color":"pink"},
        {"label": "Xray waiting", "startRow":18,"numRows":1,"startCol":30,"numCols":2,"color":"pink"},
        {"label": "Xray", "startRow":20,"numRows":2,"startCol":29,"numCols":4,"color":"yellow"}
    ],
    "caregivers": [
        {"type":DOCTOR,"label":"Doctor","location":{"row":config.doctorRow,"col":config.doctorCol},"state":IDLE},
        {"type":RECEPTIONIST,"label":"Receptionist","location":{"row":config.receptionistRow,"col":config.receptionistCol},"state":IDLE},
        {"type":RECEPTIONIST,"label":"Receptionist","location":{"row":25,"col":23},"state":IDLE},
        {"type":RECEPTIONIST,"label":"Triage Nurse","location":{"row":21,"col":23},"state":IDLE},
        {"type":RECEPTIONIST,"label":"Pharmacist","location":{"row":23,"col":10},"state":IDLE}
    ]
};