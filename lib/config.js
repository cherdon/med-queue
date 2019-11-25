var config = {
    // Images
    "patientA": "images/People-Patient-Female-icon.png",
    "patientB": "images/People-Patient-Male-icon.png",
    "doctor1": "images/Doctor_Female.png",
    "doctor2": "images/Doctor_Male.png",
    "receptionist": "images/receptionist-icon.png",

    // Window settings
    "maxCols": 50,
    "maxRows": 40,
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
    "doctorCol": 40,
    "receptionistRow": 15,
    "receptionistCol": 4
};

var visual = {
    // "areas": [
    //     {"label": "Waiting Area", "startRow":4,"numRows":5,"startCol":15,"numCols":11,"color":"pink"},
    //     {"label": "Staging Area", "startRow":config.doctorRow-1,"numRows":1,"startCol":config.doctorCol-2,"numCols":5,"color":"red"},
    //     {"label": "Reception Waiting", "startRow":24,"numRows":2,"startCol":18,"numCols":4,"color":"pink"},
    //     {"label": "Triage Waiting", "startRow":20,"numRows":2,"startCol":18,"numCols":4,"color":"pink"},
    //     {"label": "Treatment room", "startRow":2,"numRows":3,"startCol":18,"numCols":4,"color":"pink"},
    //     {"label": "Treatment waiting", "startRow":8,"numRows":2,"startCol":18,"numCols":4,"color":"pink"},
    //     {"label": "Pharmacy waiting", "startRow":18,"numRows":3,"startCol":5,"numCols":10,"color":"pink"},
    //     {"label": "Xray waiting", "startRow":18,"numRows":1,"startCol":30,"numCols":2,"color":"pink"},
    //     {"label": "Xray", "startRow":20,"numRows":2,"startCol":29,"numCols":4,"color":"yellow"}
    // ],
    "areas": [
        {"label": "Entrance", "location": {"row": config.maxRows/2, "col": 1},"numRows":4,"numCols":1,"color":"pink"},
        {"label": "Exit", "location": {"row": config.maxRows, "col": 8*config.maxCols/9},"numRows":1,"numCols":4,"color":"pink"},
        {"label": "Reception", "location": {"row": config.maxRows/10, "col": config.maxCols/14},"numRows":config.maxRows/6,"numCols":config.maxCols/7,"color":"pink"},
        {"label": "Triage", "location": {"row": config.maxRows/10, "col": 3*config.maxCols/11},"numRows":config.maxRows/6,"numCols":config.maxCols/7,"color":"pink"},
        {"label": "Waiting Area", "location": {"row": config.maxRows/12, "col": config.maxCols/2},"numRows":10,"numCols":8,"color":"pink"},
        {"label": "Bed Space", "location": {"row": 5*config.maxRows/9, "col": 2*config.maxCols/5}, "numRows":5, "numCols":11,"color":"pink"},
        {"label": "Emergency", "location": {"row": 2*config.maxRows/3, "col": config.maxCols/8}, "numRows":config.maxRows/11, "numCols":4,"color":"pink"},
        {"label": "Pharmacy", "location": {"row": 3*config.maxRows/5, "col":5*config.maxCols/7},"numRows":3,"numCols":10,"color":"pink"},
        {"label": "Wards", "location": {"row": config.maxRows, "col": config.maxCols/8},"numRows":1,"numCols":4,"color":"pink"}
    ],
    "doctors": [],
    "caregivers": [
        // {"type":DOCTOR,"label":"Doctor","location":{"row":config.doctorRow,"col":config.doctorCol},"state":IDLE},
        {"type":RECEPTIONIST,"label":"Receptionist","location":{"row":config.receptionistRow,"col":config.receptionistCol},"state":IDLE}
    ]
};

for (i = 1; i < numberCaregivers.doctor.p3; i++){
    var newTreatmentRoom = {"label": "Treatment Room " + i.toString(), "location": {"row": config.maxRows/10 + 5*(i-1), "col": 7*config.maxCols/9},"numRows":2,"numCols":4,"color":"pink"}
    var newDoctor = {"type":DOCTOR,"label":"Doctor " + i.toString(),"location":{"row": newTreatmentRoom.location.row + (newTreatmentRoom.numRows/2), "col": newTreatmentRoom.location.col + (newTreatmentRoom.numCols/2) },"state":IDLE}
    visual.areas.push(newTreatmentRoom)
    // visual.caregivers.push(newDoctor)
    visual.doctors.push(newDoctor);
}