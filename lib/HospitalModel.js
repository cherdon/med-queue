// Dynamic patients list
var patients = [];
// Initial time
var currentTime = 0
// Different areas of the hospital are put into variables
var entrance; var exit; var receptionArea; var triage; var waitingRoom; var bedSpace; var emergencyRoom; var pharmacy; var wards;
[entrance, exit, receptionArea, triage, waitingRoom, bedSpace, emergencyRoom, pharmacy, wards] = visual.areas
// Loading up patient statistics
var patientStatistics = []
for (const key of Object.keys(patientParams)) {
	patientStatistics.push(patientParams[key].statistics)
}
var csvout = [];

// Executed on script load
(function() {
	// Your page initialization code goes here
	// All elements of the DOM will be available here
	window.addEventListener("resize", redrawWindow); //Redraw whenever the window is resized
	simTimer = window.setInterval(simStep, config.animationDelay); // call the function simStep every animationDelay milliseconds
	redrawWindow();
})();


// TODO switch to start/stop/pause button
// Toggle start/stop of the simulation
function toggleSimStep(){ 
	config.isRunning = !config.isRunning;
	console.log("isRunning: " + config.isRunning);
}


// The window is resizable, so we need to translate row and column coordinates into screen coordinates x and y
function getLocationCell(location){
	var row = location.row;
	var col = location.col;
	var x = (col-1) * config.cellWidth; 			//cellWidth is set in the redrawWindow function
	var y = (row-1) * config.cellHeight; 			//cellHeight is set in the redrawWindow function
	return {"x": x, "y": y};
}


// Resetting all parameters as well as redrawing the window
function redrawWindow(){
	config.isRunning = false;
	window.clearInterval(simTimer); 											// Clearing the timer
	config.animationDelay = 550 - document.getElementById("slider1").value;		// Getting the animation delay from the slider
	simTimer = window.setInterval(simStep, config.animationDelay); 				// Calling the function simStep every animationDelay milliseconds
	document.getElementById("time").innerHTML = "Time: 0"; //reset timer on top left
	var slider_div = document.getElementById("controls"); 
	var text_to_change = slider_div.childNodes[0];
	text_to_change.nodeValue = "Animation speed " + String("00"+config.animationDelay).slice(-3) +" ms"
	// Re-initialize simulation variables
	currentTime = 0;
	patients = [];
	patientParams.P1.nextID, patientParams.P2.nextID, patientParams.P3.nextID = 0, 0, 0	
	csvout = [];
	
	for (i=0; i<visual.doctors.length; i++) {				// Doctors to be free
		visual.doctors[i].state = IDLE
	};
	for (i=0; i<visual.caregivers.length; i++) {			// Receptionists to be free
		visual.caregivers[i].state = IDLE
	};
	for (i=0; i<patientStatistics.length; i++) {			// Reset patient statistics values
		patientStatistics[i].cumulativeValue = 0
		patientStatistics[i].count = 0
		patientStatistics[i].rejected = 0
	};

	// Resize the drawing surface; remove all its contents; 
	var drawsurface = document.getElementById("surface");
	var w = window.innerWidth;
	var h = window.innerHeight;
	var surfaceWidth =(w - 3*config.WINDOWBORDERSIZE);
	var surfaceHeight= (h - 3*config.WINDOWBORDERSIZE);
	// Compute the cellWidth and cellHeight, given the size of the drawing surface
	config.cellWidth = surfaceWidth/config.maxCols;
	config.cellHeight = surfaceHeight/config.maxRows;
	
	// Setting the surface length and height parameters
	drawsurface.style.width = surfaceWidth+"px";
	drawsurface.style.height = surfaceHeight+"px";
	drawsurface.style.left = config.WINDOWBORDERSIZE/2+'px';
	drawsurface.style.top = config.WINDOWBORDERSIZE/2+'px';
	drawsurface.style.border = "thick solid #0000FF";
	drawsurface.innerHTML = ''; 								// Emptying the contents of the drawing surface, like jQuery erase().
	
	// Set the global variable, surface, equal to the d3 selection of the drawing surface
	surface = d3.select('#surface');
	surface.selectAll('*').remove(); 			// In case innerHTML = '' doesn't clear all SVG elements
	surface.style("font-size","100%");
	
	// Rebuild all contents of the drawing surface
	updateSurface();	
};


// Updating elements or adding images and drawing areas
function updateSurface(){
	//Select all svg elements of class "patient" and map it to the data list called patients
	var allpatients = surface.selectAll(".patient").data(patients);
	allpatients.exit().remove(); 												// If the list of svg elements is longer than the data list, the excess elements are in the .exit() list. Remove all SVG element no longer in the list
	var newpatients = allpatients.enter().append("g").attr("class","patient"); 	// If the list of svg elements is shorter than the data list, the new elements are in the .enter() list.
	newpatients.append("svg:image")
		.attr("x",function(d){var cell= getLocationCell(d.location); return cell.x+"px";})
		.attr("y",function(d){var cell= getLocationCell(d.location); return cell.y+"px";})
		.attr("width", Math.min(config.cellWidth,config.cellHeight)+"px")
		.attr("height", Math.min(config.cellWidth,config.cellHeight)+"px")
		.attr("xlink:href",function(d){if (d.type=="P1") return config.patientP1Image; else if (d.type=="P2") return config.patientP2Image; else return config.patientP3Image;});
	

	// Using D3 for a transition function to animate the transformation of existing SVG element
	var images = allpatients.selectAll("image");
	// Updating the patients location as they move
	images.transition()
		.attr("x",function(d){var cell= getLocationCell(d.location); return cell.x+"px";})
		.attr("y",function(d){var cell= getLocationCell(d.location); return cell.y+"px";})
		.duration(config.animationDelay).ease('linear'); // This specifies the speed and type of transition we want.


	// Creating statistics visualisation on the HTML page
	var allstatistics = surface.selectAll(".statistics").data(patientStatistics);
	var newstatistics = allstatistics.enter().append("g").attr("class","statistics");
	newstatistics.append("text")
		.attr("x", function(d) { var cell= getLocationCell(d.location); return (cell.x+config.cellWidth)+"px"; })
		.attr("y", function(d) { var cell= getLocationCell(d.location); return (cell.y+config.cellHeight/2)+"px"; })
		.attr("dy", ".35em")
		.text(""); 
	// Updating the statistics in real time
	allstatistics.selectAll("text").text(function(d) {
		var avgLengthOfStay = d.cumulativeValue/(Math.max(1,d.count)); 		// cumulativeValue and count for each statistic are always changing
		return d.name + avgLengthOfStay.toFixed(1) + " (" + d.count+")" + " [" + d.rejected + "]"; });


	// Drawing the separate areas in the hospital
	var allareas = surface.selectAll(".areas").data(visual.areas);
	var newareas = allareas.enter().append("g").attr("class","areas");
	// Draw rectangles for each area
	newareas.append("rect")
		.attr("x", function(d){return (d.location.col-1)*config.cellWidth;})
		.attr("y",  function(d){return (d.location.row-1)*config.cellHeight;})
		.attr("width",  function(d){return d.numCols*config.cellWidth;})
		.attr("height",  function(d){return d.numRows*config.cellWidth;})
		.style("fill", function(d) { return d.color; })
		.style("stroke","black")
		.style("stroke-width",1);
	// Add the area text for each area
	newareas.append("text")
		.attr("x", function(d){return (d.location.col + - 1 )*config.cellWidth;})
		.attr("y",  function(d){return (d.location.row - 2)*config.cellHeight;})
		.attr("dy", ".35em")
		.attr("style", "font-size: 70%")
		.text(function(d) { return d.label; });
	

	// Drawing all caregivers (receptionists)
	var allcaregivers = surface.selectAll(".caregiver").data(visual.caregivers);
	// Add the image
	var newcaregivers = allcaregivers.enter().append("g").attr("class","caregiver");
	newcaregivers.append("svg:image")
		.attr("x",function(d){var cell= getLocationCell(d.location); return cell.x+"px";})
		.attr("y",function(d){var cell= getLocationCell(d.location); return cell.y+"px";})
		.attr("width", Math.min(config.cellWidth,config.cellHeight)+"px")
		.attr("height", Math.min(config.cellWidth,config.cellHeight)+"px")
		.attr("xlink:href",function(d){if (d.type==DOCTOR) return config.doctorImage; else return config.receptionistImage;});	
	// Add caregiver label
	newcaregivers.append("text")
		.attr("x", function(d) { var cell= getLocationCell(d.location); return (cell.x+config.cellWidth)+"px"; })
		.attr("y", function(d) { var cell= getLocationCell(d.location); return (cell.y+config.cellHeight/2)+"px"; })
		.attr("dy", ".35em")
		.attr("style", "font-size: 70%")
		.text(function(d) { return d.label; });


	// Drawing all doctors
	var alldoctors = surface.selectAll(".doctor").data(visual.doctors);
	var newdoctors = alldoctors.enter().append("g").attr("class","doctor");
	// Add the image
	newdoctors.append("svg:image")
		.attr("x",function(d){var cell= getLocationCell(d.location); return cell.x+"px";})
		.attr("y",function(d){var cell= getLocationCell(d.location); return cell.y+"px";})
		.attr("width", Math.min(config.cellWidth,config.cellHeight)+"px")
		.attr("height", Math.min(config.cellWidth,config.cellHeight)+"px")
		.attr("xlink:href", config.doctorImage);
	// Add doctor labels
	newdoctors.append("text")
		.attr("x", function(d) { var cell= getLocationCell(d.location); return (cell.x+config.cellWidth)+"px"; })
		.attr("y", function(d) { var cell= getLocationCell(d.location); return (cell.y+config.cellHeight/2)+"px"; })
		.attr("dy", ".35em")
		.attr("style", "font-size: 70%")
		.text(function(d) { return d.label; });
}


// Math function for Poisson Distribution
function poissonDistribution(rate){
	return Math.floor(-rate*(Math.log(1-Math.random())))
}


// Getting the timeDelay when a model and rate is applied
function probabilityDelay(model, rate){
	if (model == POISSON){
		return poissonDistribution(rate)
	}
	else {
		console.log("Please account for the probability model")
	}
}


// Moving the patient and changing the state
function changePatientState(patient, nextState, targetLocation, targetType){
	if (targetType == "area"){
		patient.target = {"row": targetLocation.location.row + Math.floor(Math.random()*targetLocation.numRows),
						  "col": targetLocation.location.col + Math.floor(Math.random()*targetLocation.numCols)};
	}
	else {patient.target = targetLocation.location}
	patient.state = nextState
}


// Getting all receptionists that aren't IDLE
function receptionistAvailable(){
	var receptionists = []
	for (i=0; i<visual.caregivers.length; i++){
		if (visual.caregivers[i].state == IDLE){
			receptionists.push(i)
		}
	}
	return receptionists;
}


// Getting all doctors that aren't IDLE
function doctorsAvailable(){
	var doctors = []
	for (i=0; i<visual.doctors.length; i++){
		if (visual.doctors[i].state == IDLE){
			doctors.push(i)
		}
	}
	return doctors;
}

function P3_waiting(){
	return patients.filter(function(x){return (x.type == "P3" && x.state == WAITING)})
}

function P2_in_bed(){
	return patients.filter(function(x){return (x.type == "P2" && x.state == BED)})
}


// Patient received treatment, update statistics
function logStatistics(patient, statisticIndex){
	var timeInClinic = currentTime - patient.timeAdmitted;
	var stats = patientStatistics[statisticIndex]
	stats.cumulativeValue = stats.cumulativeValue + timeInClinic;
	stats.count = stats.count + 1;
	if (stats.count > csvout.length){
		csvout.push([Number.NaN,Number.NaN,Number.NaN,Number.NaN,Number.NaN,Number.NaN])
	}
	csvout[stats.count-1][statisticIndex] = timeInClinic;
	csvout[stats.count-1][statisticIndex + 3] = stats.rejected;
}


// Changing the caregiver between BUSY and IDLE
function changeCaregiverState(patient, caregiverNumber, caregiverType, idleState){
	if (idleState == BUSY){
		if (caregiverType == DOCTOR) {
			caregiverAttr = visual.doctors[caregiverNumber]
		}
		else {
			caregiverAttr = visual.caregivers[caregiverNumber]
		}
		caregiverAttr.state = idleState
		patient.caregiver = {"attr": caregiverAttr, "number": caregiverNumber}
	}
	else {
		if (caregiverType == DOCTOR){
			visual.doctors[patient.caregiver.number].state = IDLE;
		}
		else {
			visual.caregivers[patient.caregiver.number].state = IDLE;
		}
		patient.caregiver = {};
	}
}


// Case of P1 patient
function patientFlowP1(patient){
	var state = patient.state
	var hasArrived = (Math.abs(patient.target.row-patient.location.row)
					 +Math.abs(patient.target.col-patient.location.col))==0;
	switch(state){
		case INEMERGENCY:
			if (hasArrived){
				if (patient.timeDelay){
					// if leaving
					if ((patient.timeDelay - 1) == 0){
						patient.timeDelay = NaN
						changePatientState(patient, WARDED, wards, "spot")
						logStatistics(patient, 0)
					}
					// minus one minute of time delay
					else {
						patient.timeDelay = --patient.timeDelay
					}
				}
				// generate new time delay if just arrived
				else {
					timeDelay = probabilityDelay(models.pharmacy.name, models.pharmacy.rate)
					patient.timeDelay = timeDelay
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


// Case of P2 patient
function patientFlowP2(patient){
	var state = patient.state
	var hasArrived = (Math.abs(patient.target.row-patient.location.row)
					 +Math.abs(patient.target.col-patient.location.col))==0;
	var receptionistsAvail = receptionistAvailable()
	var P2_bed = P2_in_bed();
	switch(state){
		case RECEPTION:
			if (hasArrived){
				if (receptionistsAvail.length){
					receptionistNumber = receptionistsAvail[0]
					changeCaregiverState(patient, receptionistNumber, RECEPTIONIST, BUSY)
					targetLocation = patient.caregiver.attr
					changePatientState(patient, INRECEPTION, targetLocation, "spot")
				}
			}
		break;
		case INRECEPTION:
			if (hasArrived){
				if (patient.timeDelay){
					// if leaving
					if ((patient.timeDelay - 1) == 0){
						patient.timeDelay = NaN
						changeCaregiverState(patient, patient.caregiver.number, RECEPTIONIST, IDLE)
						changePatientState(patient, TRIAGE, triage, "area")
					}
					// minus one minute of time delay
					else {
						patient.timeDelay = --patient.timeDelay
					}
				}
				// generate new time delay if just arrived
				else {
					timeDelay = probabilityDelay(models.reception.name, models.reception.rate)
					patient.timeDelay = timeDelay
				}
			}
		break;
		case TRIAGE:
			if (hasArrived){
				if (patient.timeDelay){
					// if leaving
					if ((patient.timeDelay - 1) == 0){
						if (P2_bed.length >= max_space.Bed_Space){
							patientStatistics[1].rejected += 1;
							changePatientState(patient,DISCHARGED,entrance,"spot")
						}
						else{
							patient.timeDelay = NaN
							changePatientState(patient, BED, bedSpace, "area")
						}
					}
					// minus one minute of time delay
					else {
						patient.timeDelay = --patient.timeDelay
					}
				}
				// generate new time delay if just arrived
				else {
					timeDelay = probabilityDelay(models.triage.name, models.triage.rate)
					patient.timeDelay = timeDelay
				}
			}
		break;
		case BED:
			if (hasArrived){
				if (patient.delayState){
					if ((patient.timeDelay - 1) == 0){
						logStatistics(patient, 1)
						patient.timeDelay = NaN
						changePatientState(patient, patient.delayState, patient.delaySpace, "spot")
					}
					// minus one minute of time delay
					else {
						patient.timeDelay = --patient.timeDelay
					}
				}
				else {
					var randBedProb = Math.random()
					// If going home after checkup
					if (randBedProb< probabilities.bedHome){
						patient.timeDelay = probabilityDelay(models.doctorP2.name, models.doctorP2.rate)
						patient.delayState = DISCHARGED
						patient.delaySpace = exit
					}
					// If going to ward after checkup
					else if (randBedProb < probabilities.bedHome + probabilities.bedWard){
						patient.timeDelay = probabilityDelay(models.P2toWard.name, models.P2toWard.rate)
						//console.log("Time taken for this patient: " + String(patient.timeDelay))
						patient.delayState = WARDED
						patient.delaySpace = wards
					}
					// If short stay in bed space
					else {
						patient.timeDelay = probabilityDelay(models.P2toStay.name, models.P2toStay.rate)
						//console.log("Time taken for this patient: " + String(patient.timeDelay))
						patient.delayState = DISCHARGED
						patient.delaySpace = exit
					}
					// logStatistics(patient, 1)
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


// Case of P3 patient
function patientFlowP3(patient){
	var state = patient.state
	var hasArrived = (Math.abs(patient.target.row-patient.location.row)
					 +Math.abs(patient.target.col-patient.location.col))==0;
	var receptionistsAvail = receptionistAvailable();
	var doctorsAvail = doctorsAvailable();
	var P3_wait = P3_waiting();
	switch(state){
		case RECEPTION:
			if (hasArrived){
				if (receptionistsAvail.length){
					receptionistNumber = receptionistsAvail[0]
					changeCaregiverState(patient, receptionistNumber, RECEPTIONIST, BUSY)
					targetLocation = patient.caregiver.attr
					changePatientState(patient, INRECEPTION, targetLocation, "spot")
				}
			}
		break;
		case INRECEPTION:
			if (hasArrived){
				if (patient.timeDelay){
					// if leaving
					if ((patient.timeDelay - 1) == 0){
						patient.timeDelay = NaN
						changeCaregiverState(patient, patient.caregiver.number, RECEPTIONIST, IDLE)
						changePatientState(patient, TRIAGE, triage, "area")
					}
					// minus one minute of time delay
					else {
						patient.timeDelay = --patient.timeDelay
					}
				}
				// generate new time delay if just arrived
				else {
					timeDelay = probabilityDelay(models.reception.name, models.reception.rate)
					patient.timeDelay = timeDelay
				}
			}
		break;
		case TRIAGE:
			if (hasArrived){
				if (patient.timeDelay){
					// if leaving
					if ((patient.timeDelay - 1) == 0){
						patient.timeDelay = NaN
						if (P3_wait.length >= max_space.Waiting_Area){
							patientStatistics[2].rejected += 1;
							changePatientState(patient, DISCHARGED, entrance, "spot");
						}
						else{
							changePatientState(patient, WAITING, waitingRoom, "area")
						}
						
					}
					// minus one minute of time delay
					else {
						patient.timeDelay = --patient.timeDelay
					}
				}
				// generate new time delay if just arrived
				else {
					timeDelay = probabilityDelay(models.triage.name, models.triage.rate)
					patient.timeDelay = timeDelay
				}
			}
		break;
		case WAITING:
			if (hasArrived){
				if (doctorsAvail.length){
					doctorNumber = doctorsAvail[0]
					changeCaregiverState(patient, doctorNumber, DOCTOR, BUSY)
					targetLocation = patient.caregiver.attr
					changePatientState(patient, INTREATMENT, targetLocation, "spot")
				}
			}
		break;
		case INTREATMENT:
			if (hasArrived){
				if (patient.timeDelay){
					if ((patient.timeDelay - 1) == 0){
						patient.timeDelay = NaN
						changeCaregiverState(patient, patient.caregiver.number, DOCTOR, IDLE)
						changePatientState(patient, PHARMACY, pharmacy, "area")
					}
					else {
						patient.timeDelay = --patient.timeDelay
					}
				}
				else {
					timeDelay = probabilityDelay(models.doctorP3.name, models.doctorP3.rate)
					patient.timeDelay = timeDelay
				}
			}
		break;
		case PHARMACY:
			if (hasArrived){
				if (patient.timeDelay){
					// if leaving
					if ((patient.timeDelay - 1) == 0){
						patient.timeDelay = NaN
						changePatientState(patient, DISCHARGED, exit, "spot")
						logStatistics(patient, 2)
					}
					// minus one minute of time delay
					else {
						patient.timeDelay = --patient.timeDelay
					}
				}
				// generate new time delay if just arrived
				else {
					timeDelay = probabilityDelay(models.pharmacy.name, models.pharmacy.rate)
					patient.timeDelay = timeDelay
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


// Updating the patient states and moving the patients based on the surface size
function updatePatient(patientIndex){
	patientIndex = Number(patientIndex);
	var patient = patients[patientIndex];

	// Get the original location of the patient
	var row = patient.location.row;
	var col = patient.location.col;
	var type = patient.type;

	// Change the target location and states
	if (type == "P1"){
		patientFlowP1(patient);
	}
	else if (type == "P2"){
		patientFlowP2(patient);
	}
	else {
		patientFlowP3(patient);
	};
	
	// Get the target location of the patient
	var targetRow = patient.target.row;
	var targetCol = patient.target.col;
	// compute the distance to the target destination
	var rowsToGo = targetRow - row;
	var colsToGo = targetCol - col;
	// Compute the cell to move to
	var newRow = row + Math.min(Math.abs(rowsToGo),config.patientSpeed)*Math.sign(rowsToGo);
	var newCol = col + Math.min(Math.abs(colsToGo),config.patientSpeed)*Math.sign(colsToGo);
	// Updating the location of the patient
	patient.location.row = newRow;
	patient.location.col = newCol;
	
}


// Adding Patients
function addDynamicAgents(){
	if (Math.random()< probabilities.arrival){
		var newpatient = {"id":1,
						  "location":{"row":entrance.location.row,"col":entrance.location.col},
						  "state":RECEPTION,
						  "timeAdmitted":currentTime,
						  "caregiver": {}}

		var randPatientProb = Math.random()
		if (randPatientProb < patientParams.P1.prob){
			changePatientState(newpatient, INEMERGENCY, emergencyRoom, "spot")
			// newpatient.state = INEMERGENCY
			// newpatient.target = emergencyRoom.location
			newpatient.type = "P1";
			newpatient.id = ++patientParams.P1.nextID;
		}
		else {
			if (randPatientProb < patientParams.P1.prob + patientParams.P2.prob) {
				newpatient.type = "P2"
				newpatient.id = ++patientParams.P2.nextID;
			}
			else {
				newpatient.type = "P3"
				newpatient.id = ++patientParams.P3.nextID;
			}
			newpatient.target = {"row":receptionArea.location.row + Math.floor(Math.random()* receptionArea.numRows),
								 "col":receptionArea.location.col + Math.floor(Math.random()* receptionArea.numCols)}
		}	
		patients.push(newpatient);
	}	
}


// Moving patients
function updateDynamicAgents(){
	// Loop over all the agents and update their states
	for (var patientIndex in patients){
		updatePatient(patientIndex);
	}
	updateSurface();	
}


// Removing patients
function removeDynamicAgents(){
	var allpatients = surface.selectAll(".patient").data(patients);
	var treatedpatients = allpatients.filter(function(d,i){return d.state==EXITED;});
	treatedpatients.remove();
	
	// Remove the EXITED patients from the patients list using a filter command
	patients = patients.filter(function(d){return d.state!=EXITED;});
}


function simStep(){
	if (config.isRunning){ 
		// Increment current time (for computing statistics)
		currentTime++;
		document.getElementById("time").innerHTML = "Time: " + String(currentTime);
		// Change dynamic agents location or add/remove them from the hospital
		addDynamicAgents();
		updateDynamicAgents();
		removeDynamicAgents();
	}
}
