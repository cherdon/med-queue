// patients is a dynamic list, initially empty
var patients = [];

// Different areas of the hospital are put into variables
var entrance = visual.areas[0];
var exit = visual.areas[1];
var receptionArea = visual.areas[2];
var triage = visual.areas[3];
var waitingRoom = visual.areas[4];
var bedSpace = visual.areas[5];
var emergencyRoom = visual.areas[6];
var pharmacy = visual.areas[7];
var wards = visual.areas[8];

var currentTime = 0;
var statistics = [
{"name":"Average wait before treatment, P1: ","location":{"row":10*config.maxRows/13,"col":3*config.maxCols/11},"cumulativeValue":0,"count":0},
{"name":"Average wait before treatment, P2: ","location":{"row":10*config.maxRows/13 + 2,"col":3*config.maxCols/11},"cumulativeValue":0,"count":0},
{"name":"Average wait before treatment, P3: ","location":{"row":10*config.maxRows/13 + 4,"col":3*config.maxCols/11},"cumulativeValue":0,"count":0}
];


// This next function is executed when the script is loaded. It contains the page initialization code.
(function() {
	// Your page initialization code goes here
	// All elements of the DOM will be available here
	window.addEventListener("resize", redrawWindow); //Redraw whenever the window is resized
	simTimer = window.setInterval(simStep, config.animationDelay); // call the function simStep every animationDelay milliseconds
	redrawWindow();
})();

// TODO switch to start/stop/pause button
// Function to Start/Stop the Simulation 
function toggleSimStep(){ 
	//this function is called by a click event on the html page. 
	// Search BasicAgentModel.html to find where it is called.
	config.isRunning = !config.isRunning;
	console.log("isRunning: " + config.isRunning);
}

// TODO isRunning to be local in this model
function resetParams(){
	config.isRunning = false;
}

// Resetting all parameters as well as redrawing the window
function redrawWindow(){
	config.isRunning = false; // used by simStep
	window.clearInterval(simTimer); // clear the Timer
	config.animationDelay = 550 - document.getElementById("slider1").value;
	simTimer = window.setInterval(simStep, config.animationDelay); // call the function simStep every animationDelay milliseconds
	
	// Re-initialize simulation variables
	
	nextPatientID_P1 = 0; // increment this and assign it to the next entering patient of P1
	nextPatientID_P2 = 0; // increment this and assign it to the next entering patient of P2
	nextPatientID_P3 = 0; // increment this and assign it to the next entering patient of P3
	currentTime = 0;
	statistics[0].cumulativeValue=0;
	statistics[0].count=0;
	statistics[1].cumulativeValue=0;
	statistics[1].count=0;
	statistics[2].cumulativeValue=0;
	statistics[2].count=0;
	patients = [];

	
	//resize the drawing surface; remove all its contents; 
	var drawsurface = document.getElementById("surface");
	var creditselement = document.getElementById("time");
	var w = window.innerWidth;
	var h = window.innerHeight;
	var surfaceWidth =(w - 3*config.WINDOWBORDERSIZE);
	var surfaceHeight= (h-creditselement.offsetHeight - 3*config.WINDOWBORDERSIZE);
	
	drawsurface.style.width = surfaceWidth+"px";
	drawsurface.style.height = surfaceHeight+"px";
	drawsurface.style.left = config.WINDOWBORDERSIZE/2+'px';
	drawsurface.style.top = config.WINDOWBORDERSIZE/2+'px';
	drawsurface.style.border = "thick solid #0000FF"; //The border is mainly for debugging; okay to remove it
	drawsurface.innerHTML = ''; //This empties the contents of the drawing surface, like jQuery erase().
	
	// Compute the cellWidth and cellHeight, given the size of the drawing surface
	numCols = config.maxCols;
	config.cellWidth = surfaceWidth/numCols;
	numRows = config.maxRows;  //Math.ceil(surfaceHeight/cellWidth);
	config.cellHeight = surfaceHeight/numRows;
	
	// In other functions we will access the drawing surface using the d3 library. 
	//Here we set the global variable, surface, equal to the d3 selection of the drawing surface
	surface = d3.select('#surface');
	surface.selectAll('*').remove(); // we added this because setting the inner html to blank may not remove all svg elements
	surface.style("font-size","100%");
	// rebuild contents of the drawing surface
	updateSurface();	
};

// The window is resizable, so we need to translate row and column coordinates into screen coordinates x and y
function getLocationCell(location){
	var row = location.row;
	var col = location.col;
	var x = (col-1)*config.cellWidth; //cellWidth is set in the redrawWindow function
	var y = (row-1)*config.cellHeight; //cellHeight is set in the redrawWindow function
	return {"x":x,"y":y};
}

function updateSurface(){
	// This function is used to create or update most of the svg elements on the drawing surface.
	// See the function removeDynamicAgents() for how we remove svg elements
	
	//Select all svg elements of class "patient" and map it to the data list called patients
	var allpatients = surface.selectAll(".patient").data(patients);
	
	// If the list of svg elements is longer than the data list, the excess elements are in the .exit() list
	// Excess elements need to be removed:
	allpatients.exit().remove(); //remove all svg elements associated with entries that are no longer in the data list
	// (This remove function is needed when we resize the window and re-initialize the patients array)
	 
	// If the list of svg elements is shorter than the data list, the new elements are in the .enter() list.
	// The first time this is called, all the elements of data will be in the .enter() list.
	// Create an svg group ("g") for each new entry in the data list; give it class "patient"
	var newpatients = allpatients.enter().append("g").attr("class","patient"); 
	//Append an image element to each new patient svg group, position it according to the location data, and size it to fill a cell
	// Also note that we can choose a different image to represent the patient based on the patient type
	newpatients.append("svg:image")
	 .attr("x",function(d){var cell= getLocationCell(d.location); return cell.x+"px";})
	 .attr("y",function(d){var cell= getLocationCell(d.location); return cell.y+"px";})
	 .attr("width", Math.min(config.cellWidth,config.cellHeight)+"px")
	 .attr("height", Math.min(config.cellWidth,config.cellHeight)+"px")
	 .attr("xlink:href",function(d){if (d.type=="P1") return config.patientP1Image; else if (d.type=="P2") return config.patientP2Image; else return config.patientP3Image;});
	
	// For the existing patients, we want to update their location on the screen 
	// but we would like to do it with a smooth transition from their previous position.
	// D3 provides a very nice transition function allowing us to animate transformations of our svg elements.
	
	//First, we select the image elements in the allpatients list
	var images = allpatients.selectAll("image");
	// Next we define a transition for each of these image elements.
	// Note that we only need to update the attributes of the image element which change
	images.transition()
	 .attr("x",function(d){var cell= getLocationCell(d.location); return cell.x+"px";})
	 .attr("y",function(d){var cell= getLocationCell(d.location); return cell.y+"px";})
	 .duration(config.animationDelay).ease('linear'); // This specifies the speed and type of transition we want.
 
	// Patients will leave the clinic when they have been discharged. 
	// That will be handled by a different function: removeDynamicAgents
 
	
	// The simulation should serve some purpose 
	// so we will compute and display the average length of stay of each patient type.
	// We created the array "statistics" for this purpose.
	// Here we will create a group for each element of the statistics array (two elements)
	var allstatistics = surface.selectAll(".statistics").data(statistics);
	var newstatistics = allstatistics.enter().append("g").attr("class","statistics");
	// For each new statistic group created we append a text label
	newstatistics.append("text")
	.attr("x", function(d) { var cell= getLocationCell(d.location); return (cell.x+config.cellWidth)+"px"; })
    .attr("y", function(d) { var cell= getLocationCell(d.location); return (cell.y+config.cellHeight/2)+"px"; })
    .attr("dy", ".35em")
	.text(""); 
	
	// The data in the statistics array are always being updated.
	// So, here we update the text in the labels with the updated information.
	allstatistics.selectAll("text").text(function(d) {
		var avgLengthOfStay = d.cumulativeValue/(Math.max(1,d.count)); // cumulativeValue and count for each statistic are always changing
		return d.name+avgLengthOfStay.toFixed(1); }); //The toFixed() function sets the number of decimal places to display

	// Finally, we would like to draw boxes around the different areas of our system. We can use d3 to do that too.
	var allareas = surface.selectAll(".areas").data(visual.areas);
	var newareas = allareas.enter().append("g").attr("class","areas");
	// For each new area, append a rectangle to the group
	newareas.append("rect")
	.attr("x", function(d){return (d.location.col-1)*config.cellWidth;})
	.attr("y",  function(d){return (d.location.row-1)*config.cellHeight;})
	.attr("width",  function(d){return d.numCols*config.cellWidth;})
	.attr("height",  function(d){return d.numRows*config.cellWidth;})
	.style("fill", function(d) { return d.color; })
	.style("stroke","black")
	.style("stroke-width",1);
	
	newareas.append("text")
	.attr("x", function(d){return (d.location.col + - 1 )*config.cellWidth;})
	.attr("y",  function(d){return (d.location.row - 2)*config.cellHeight;})
	.attr("dy", ".35em")
	.attr("style", "font-size: 70%")
	.text(function(d) { return d.label; });
	
	//Select all svg elements of class "caregiver" and map it to the data list called caregivers
	var allcaregivers = surface.selectAll(".caregiver").data(visual.caregivers);
	//This is not a dynamic class of agents so we only need to set the svg elements for the entering data elements.
	// We don't need to worry about updating these agents or removing them
	// Create an svg group ("g") for each new entry in the data list; give it class "caregiver"
	var newcaregivers = allcaregivers.enter().append("g").attr("class","caregiver");
	newcaregivers.append("svg:image")
	 .attr("x",function(d){var cell= getLocationCell(d.location); return cell.x+"px";})
	 .attr("y",function(d){var cell= getLocationCell(d.location); return cell.y+"px";})
	 .attr("width", Math.min(config.cellWidth,config.cellHeight)+"px")
	 .attr("height", Math.min(config.cellWidth,config.cellHeight)+"px")
	 .attr("xlink:href",function(d){if (d.type==DOCTOR) return config.doctorImage; else return config.receptionistImage;});
	
	// It would be nice to label the caregivers, so we add a text element to each new caregiver group
	newcaregivers.append("text")
    .attr("x", function(d) { var cell= getLocationCell(d.location); return (cell.x+config.cellWidth)+"px"; })
    .attr("y", function(d) { var cell= getLocationCell(d.location); return (cell.y+config.cellHeight/2)+"px"; })
	.attr("dy", ".35em")
	.attr("style", "font-size: 70%")
	.text(function(d) { return d.label; });


	//Select all svg elements of class "caregiver" and map it to the data list called caregivers
	var alldoctors = surface.selectAll(".doctor").data(visual.doctors);
	//This is not a dynamic class of agents so we only need to set the svg elements for the entering data elements.
	// We don't need to worry about updating these agents or removing them
	// Create an svg group ("g") for each new entry in the data list; give it class "caregiver"
	var newdoctors = alldoctors.enter().append("g").attr("class","doctor");
	newdoctors.append("svg:image")
	 .attr("x",function(d){var cell= getLocationCell(d.location); return cell.x+"px";})
	 .attr("y",function(d){var cell= getLocationCell(d.location); return cell.y+"px";})
	 .attr("width", Math.min(config.cellWidth,config.cellHeight)+"px")
	 .attr("height", Math.min(config.cellWidth,config.cellHeight)+"px")
	 .attr("xlink:href", config.doctorImage);
	
	// It would be nice to label the caregivers, so we add a text element to each new caregiver group
	newdoctors.append("text")
    .attr("x", function(d) { var cell= getLocationCell(d.location); return (cell.x+config.cellWidth)+"px"; })
    .attr("y", function(d) { var cell= getLocationCell(d.location); return (cell.y+config.cellHeight/2)+"px"; })
	.attr("dy", ".35em")
	.attr("style", "font-size: 70%")
	.text(function(d) { return d.label; });
	
	
}


function addDynamicAgents(){
	if (Math.random()< probArrival){
		var newpatient = {"id":1,
						  "location":{"row":entrance.location.row,"col":entrance.location.col},
						  "state":RECEPTION,
						  "timeAdmitted":currentTime,
						  "receptionist": {},
						  "doctor": {}}
		// TODO Queue at reception area
		var randPatientProb = Math.random()
		if (randPatientProb < patientParams.P1.prob){
			newpatient.type = "P1";
			
			newpatient.state = INEMERGENCY
			newpatient.target = emergencyRoom.location
			newpatient.id = ++nextPatientID_P1;
		}
		else {
			if (randPatientProb < patientParams.P1.prob + patientParams.P2.prob) {
				newpatient.type = "P2"
				newpatient.id = ++nextPatientID_P2;
			}
			else {
				newpatient.type = "P3"
				newpatient.id = ++nextPatientID_P3;
			}
			newpatient.target = {"row":receptionArea.location.row + Math.floor(Math.random()* receptionArea.numRows),
								 "col":receptionArea.location.col + Math.floor(Math.random()* receptionArea.numCols)}
		}	
		patients.push(newpatient);
	}	
}

function receptionistAvailable(){
	var receptionists = []
	for (i=0; i<visual.caregivers.length; i++){
		if (visual.caregivers[i].state == IDLE){
			receptionists.push(i)
		}
	}
	return receptionists;
}

function doctorsAvailable(){
	var doctors = []
	for (i=0; i<visual.doctors.length; i++){
		if (visual.doctors[i].state == IDLE){
			doctors.push(i)
		}
	}
	return doctors;
}

function patientFlowP1(patient){
	var state = patient.state
	var hasArrived = (Math.abs(patient.target.row-patient.location.row)
					 +Math.abs(patient.target.col-patient.location.col))==0;
	switch(state){
		case INEMERGENCY:
			if (hasArrived){
				if (Math.random()< probEmerTime){
					var timeInClinic = currentTime - patient.timeAdmitted;
					stats = statistics[0]
					stats.cumulativeValue = stats.cumulativeValue+timeInClinic;
					stats.count = stats.count + 1;
					patient.state = WARDED;
					patient.target = wards.location;
				}
			}
		break;
		case WARDED:
			if (hasArrived){
				patient.state = EXITED
			}
		break;
		default:
		break;
	}
}

function changeState(target, name, state){
	for (i=0; i<target.length; i++){
		if (target[i].label == name){
			target[i].state = state;
		}
	}
}

function patientFlowP2(patient){
	var state = patient.state
	var hasArrived = (Math.abs(patient.target.row-patient.location.row)
					 +Math.abs(patient.target.col-patient.location.col))==0;
	var receptionistsAvail = receptionistAvailable()
	switch(state){
		case RECEPTION:
			if (hasArrived){
				if (receptionistsAvail.length){
					receptionistNumber = receptionistsAvail[0]
					receptionistAttr = visual.caregivers[receptionistNumber]
					receptionistAttr.state = BUSY

					patient.state = INRECEPTION
					patient.target = receptionistAttr.location
					patient.receptionist.attr = receptionistAttr
					patient.receptionist.number = receptionistNumber
				}
			}
		break;
		case INRECEPTION:
			if (hasArrived){
				if (Math.random()<probReceptionTime){
					visual.caregivers[patient.receptionist.number].state = IDLE;
					
					patient.state = INTRIAGE;
					patient.target = {"row": triage.location.row + Math.floor(Math.random()*triage.numRows),
									  "col": triage.location.col + Math.floor(Math.random()*triage.numCols)};
					patient.receptionist = {};
				}
			}
		break;
		case INTRIAGE:
			if (hasArrived){
				if (Math.random()<probTriage){
					patient.state = INBED
					patient.target = {"row": bedSpace.location.row + Math.floor(Math.random()*bedSpace.numRows),
									  "col": bedSpace.location.col + Math.floor(Math.random()*bedSpace.numCols)};
				}
			}
		break;
		case INBED:
			if (hasArrived){
				var randBedProb = Math.random()
				if (randBedProb< probBedHome){
					patient.state = DISCHARGED;
					patient.target = exit.location

					// compute statistics for discharged patient
					var timeInClinic = currentTime - patient.timeAdmitted;
					var stats = statistics[1];
					stats.cumulativeValue = stats.cumulativeValue+timeInClinic;
					stats.count = stats.count + 1;
				}
				else if (randBedProb < probBedHome + probBedWard){
					patient.state = WARDED
					patient.target = wards.location
					var timeInClinic = currentTime - patient.timeAdmitted;
					var stats = statistics[1];
					stats.cumulativeValue = stats.cumulativeValue+timeInClinic;
					stats.count = stats.count + 1;
				}
			}
		break;
		case WARDED:
			if (hasArrived){
				patient.state = EXITED
			}
		break;
		case DISCHARGED:
			if (hasArrived){
				patient.state = EXITED
			}
		break;
		default:
		break;
	}
}

function patientFlowP3(patient){
	var state = patient.state
	var hasArrived = (Math.abs(patient.target.row-patient.location.row)
					 +Math.abs(patient.target.col-patient.location.col))==0;
	var receptionistsAvail = receptionistAvailable()
	var doctorsAvail = doctorsAvailable()
	switch(state){
		case RECEPTION:
			if (hasArrived){
				if (receptionistsAvail.length){
					receptionistNumber = receptionistsAvail[0]
					receptionistAttr = visual.caregivers[receptionistNumber]
					receptionistAttr.state = BUSY

					patient.state = INRECEPTION
					patient.target = receptionistAttr.location
					patient.receptionist.attr = receptionistAttr
					patient.receptionist.number = receptionistNumber
				}
			}
		break;
		case INRECEPTION:
			if (hasArrived){
				if (Math.random()<probReceptionTime){
					visual.caregivers[patient.receptionist.number].state = IDLE;
					
					patient.state = INTRIAGE;
					patient.target = {"row": triage.location.row + Math.floor(Math.random()*triage.numRows),
									  "col": triage.location.col + Math.floor(Math.random()*triage.numCols)};
					patient.receptionist = NaN;
				}
			}
		break;
		case INTRIAGE:
			if (hasArrived){
				if (Math.random()<probTriage){
					patient.state = WAITING
					patient.target = {"row": waitingRoom.location.row + Math.floor(Math.random()*waitingRoom.numRows),
									  "col": waitingRoom.location.col + Math.floor(Math.random()*waitingRoom.numCols)};
				}
			}
		break;
		case WAITING:
			if (hasArrived){
				if (doctorsAvail.length){
					doctorNumber = doctorsAvail[0]
					doctorAttr = visual.doctors[doctorNumber]
					doctorAttr.state = BUSY

					patient.state = INTREATMENT
					patient.target = doctorAttr.location
					patient.doctor.attr = doctorAttr
					patient.doctor.number = doctorNumber
				}
			}
		break;
		case INTREATMENT:
			if (hasArrived){
				if (Math.random()<probDocTime){
					visual.doctors[patient.doctor.number].state = IDLE
					patient.state = INPHARMACY
					patient.target = {"row": pharmacy.location.row + Math.floor(Math.random()*pharmacy.numRows),
									  "col": pharmacy.location.col + Math.floor(Math.random()*pharmacy.numCols)};
					patient.doctor = NaN;
				}
			}
		break;
		case INPHARMACY:
			if (hasArrived){
				if (Math.random()<probPharmacy){
					patient.state = DISCHARGED;
					patient.target = exit.location

					// compute statistics for discharged patient
					var timeInClinic = currentTime - patient.timeAdmitted;
					var stats = statistics[2];
					stats.cumulativeValue = stats.cumulativeValue+timeInClinic;
					stats.count = stats.count + 1;
				}
			}
		break;
		case DISCHARGED:
			if (hasArrived){
				patient.state = EXITED;
			}
		break;
		default:
		break;
	}
}

function updatePatient(patientIndex){
	//patientIndex is an index into the patients data array
	patientIndex = Number(patientIndex); //it seems patientIndex was coming in as a string
	var patient = patients[patientIndex];
	// get the current location of the patient
	var row = patient.location.row;
	var col = patient.location.col;
	var type = patient.type;

	if (type == "P1"){
		patientFlowP1(patient);
	}
	else if (type == "P2"){
		patientFlowP2(patient);
	}
	else {
		patientFlowP3(patient);
	};
	
	// set the destination row and column
	var targetRow = patient.target.row;
	var targetCol = patient.target.col;
	// compute the distance to the target destination
	var rowsToGo = targetRow - row;
	var colsToGo = targetCol - col;
	// set the speed
	var cellsPerStep = 1;
	// compute the cell to move to
	var newRow = row + Math.min(Math.abs(rowsToGo),cellsPerStep)*Math.sign(rowsToGo);
	var newCol = col + Math.min(Math.abs(colsToGo),cellsPerStep)*Math.sign(colsToGo);
	// update the location of the patient
	patient.location.row = newRow;
	patient.location.col = newCol;
	
}

function removeDynamicAgents(){
	// We need to remove patients who have been discharged. 
	//Select all svg elements of class "patient" and map it to the data list called patients
	var allpatients = surface.selectAll(".patient").data(patients);
	//Select all the svg groups of class "patient" whose state is EXITED
	var treatedpatients = allpatients.filter(function(d,i){return d.state==EXITED;});
	// Remove the svg groups of EXITED patients: they will disappear from the screen at this point
	treatedpatients.remove();
	
	// Remove the EXITED patients from the patients list using a filter command
	patients = patients.filter(function(d){return d.state!=EXITED;});
	// At this point the patients list should match the images on the screen one for one 
	// and no patients should have state EXITED
}


function updateDynamicAgents(){
	// loop over all the agents and update their states
	for (var patientIndex in patients){
		updatePatient(patientIndex);
	}
	updateSurface();	
}

function simStep(){
	//This function is called by a timer; if running, it executes one simulation step 
	//The timing interval is set in the page initialization function near the top of this file
	if (config.isRunning){ //the isRunning variable is toggled by toggleSimStep
		// Increment current time (for computing statistics)
		currentTime++;
		// Sometimes new agents will be created in the following function
		addDynamicAgents();
		// In the next function we update each agent
		updateDynamicAgents();
		// Sometimes agents will be removed in the following function
		removeDynamicAgents();
	}
}
