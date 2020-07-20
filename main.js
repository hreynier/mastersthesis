// - Data Collection + Processing - //
// ---- AUTHOR: Harvey Reynier --- //
// ------- DESCRIPTION ------- //


// DESCRIPTION GOES HERE.
//

// Declare package imports.

/*module.exports = {
  distance: require('@turf/distance'),
  bearing: require('@turf/bearing')
};
*/


/*import distance from './src/turf.'
import bearing from '@turf/bearing'
*/




// Declare globals
const mapCenter = [-73.953294, 40.756234];
const sceneElement = document.querySelector('a-scene');

// Declare global arrays + objects
let station_object = [];
let pollutionObject;


// Declare functions
function getCoordsFromCenter(centerCoordinates, nextCoordinates) {
	// Declare center XY coordinate object.
	const centerXY = { x: 0, y: 0 }

	// Calculate bearing (degrees) and distance between two lat/lon pairs.
	let coordBearing = turf.bearing(centerCoordinates, nextCoordinates);
	let coordDistance = turf.distance(centerCoordinates, nextCoordinates);

	// Calculate XY, through solving a cartesian 2D coordinate problem. Unit is taken as 100m, change the '* 10' to change the scale.
	// See link for more: https://gis.stackexchange.com/questions/353701/converting-latitude-and-longitude-to-xy-coordinates
	// https://stackoverflow.com/questions/1185408/converting-from-longitude-latitude-to-cartesian-coordinates
	const xy = {
		x: centerXY.x + coordDistance * 1.68 * Math.cos(coordBearing * Math.PI / 180),
		y: centerXY.y + coordDistance * 1.68 * Math.sin(coordBearing * Math.PI / 180)
	}

	return xy
}

// Stations Data
async function getPoints(pointType) {
	let url = `http://localhost:3000/data/${pointType}`;
	console.log(`API Endpoint: ${url}`);

	// Declare Variables to assign values to.
	let latitude;
	let longitude;
	let location;
	let dataName;
	let dataValue;
	let posX = [];
	let posZ = [];
	let posY = [];
	let posXYZ = [];

	// Execute fetch request + store through promises.
	const response = await fetch(url);
	const json = await response.json();

	// As JSON file is delivered as an object from the open NYC datastore, need to
	// parse correctly.
	const entries = Object.entries(json);

	// Loop through JSON to extract values.
	for (const [key, val] of entries) {
		//console.log(`There are ${value} of ${key}`);

		// JSON object has meta subobject and data subobject. We need to loop through the data.
		if (key == 'data') {
			for (let [index, entry] of Object.entries(val)) {
				//console.log(`Entry: ${entry}, Ind: ${index}`);

				// Assign location and data name to variables. This is hard coded, but can be soft coded.
				// by parsing through the meta data and using if loops to determine index of where location etc is.
				location = entry[11];
				dataName = entry[10];

				//console.log(`Location: ${location}, Value/Name: ${dataValue}/${dataName}`);

				// Location data is stored as 'POINT(-70.56456 42.243524543)' and such we need to extract the lat/lon from this.
				// This is done using String RegExpressions.
				location = location.replace(/[^0-9.+-\s]/g, '');
				location = location.split(' ');

				// Starts from 1 as first entry is the initial space.
				latitude = parseFloat(location[2]);
				longitude = parseFloat(location[1]);
				//console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

				// Store lat/lon pair in array and calculate cartesian position for use in AFrame environment.
				let lonlat = [longitude, latitude];
				let cartesian = getCoordsFromCenter(mapCenter, lonlat);
				let positionX = cartesian.y;
				let positionZ = -cartesian.x; //Not sure why this is x/y reverse? but it works.
				let positionY = 0;
				//console.log(`AFrame Z Position: ${positionZ}, AFrame X Position: ${positionX}`);

				posX.push(positionX);
				posZ.push(positionZ);
				posY.push(positionY);
				let row = [positionX, positionY, positionZ];
				posXYZ.push(row);
			}
		}
	}
	let position = {
		xyz: posXYZ
	}
	return position;
}

function renderPoint(positionObject, elementClass, geom, col) {

	for (let [index, entry] of Object.entries(positionObject)) {
		//console.log(`index: ${index}, value: ${entry}`);
		for (let [ind, ent] of Object.entries(entry)) {
			//console.log(`ind: ${ind}, Row : ${ent}`);
			let posX = parseFloat(ent[0]);
			let posY = parseFloat(ent[1]);
			let posZ = parseFloat(ent[2]);

			console.log(`posX: ${posX}, Y: ${posY}, Z: ${posZ}`);

			// Create new element for points.
			let pointEl = document.createElement('a-entity');
			pointEl.setAttribute('class', elementClass);
			pointEl.setAttribute('position', { x: posX, y: posY, z: posZ });
			pointEl.setAttribute('material', { color: col });
			pointEl.setAttribute('geometry', { primitive: geom, width: 1, height: 1, depth: 1 });
			pointEl.setAttribute('scale', { x: 0.02, y: 5, z: 0.02 }); // Hard-coded - need to implement update method.
			//console.log(`Element: ${ind}`);


			sceneElement.appendChild(pointEl);

		}
	}

}


async function fetchEmbeddedData(datafamily) {
	let url = `http://localhost:3000/data/embed/${datafamily}`;

	let pop00Min = Number.MAX_VALUE;
	let pop00Max = Number.MIN_VALUE;
	let pop10Min = Number.MAX_VALUE;
	let pop10Max = Number.MIN_VALUE;
	let popDiffMin = Number.MAX_VALUE;
	let popDiffMax = Number.MIN_VALUE;
	let resultArr = [];


	const response = await fetch(url);
	const json = await response.json();

	for (var i = 0; i < json.length; i++) {
		let obj = json[i];
		let distName = (obj.CDName);
		let population2000 = parseInt(obj.pop2000);
		let population2010 = parseInt(obj.pop2010);
		let populationChange = parseFloat(obj.popChange);
		//console.log(`lat: ${lat}, lon: ${lon}, type: ${typeof(lon)}`);
		if (population2000 > pop00Max) {
			pop00Max = population2000;
		}
		if (population2000 < pop00Min) {
			pop00Min = population2000;
		}

		if (population2010 > pop10Max) {
			pop10Max = population2010;
		}
		if (population2010 < pop10Min) {
			pop10Min = population2010;
		}

		if (populationChange > popDiffMax) {
			popDiffMax = populationChange;
		}
		if (populationChange < popDiffMin) {
			popDiffMin = populationChange;
		}

		let array = [distName, population2000, population2010, populationChange];
		resultArr.push(array);
	}

	const population = {
		min00: pop00Min,
		max00: pop00Max,
		min10: pop10Min,
		max10: pop10Max,
		minDiff: popDiffMin,
		maxDiff: popDiffMax,
		data: resultArr
	}

	let styledOut = colourEmbedded(population);
	//console.log(styledOut);

	return styledOut;
}

function colourEmbedded(dataObject) {

	let loCol = [222, 235, 247];
	let hiCol = [50, 134, 195];

	let min00 = dataObject.min00;
	let max00 = dataObject.max00;

	let min10 = dataObject.min10;
	let max10 = dataObject.max10;

	let minDiff = dataObject.minDiff;
	let maxDiff = dataObject.maxDiff;

	let array = dataObject.data;

	let district = [];
	let style00 = [];
	let style10 = [];
	let styleDiff = [];

	for (x of array) {

		let delta00 = (x[1] - min00) / (max00 - min00);
		let delta10 = (x[2] - min10) / (max10 - min10);
		let deltaDiff = (x[3] - minDiff) / (maxDiff - minDiff);

		//	Assign colour based on ratio between min and max datum, and thus min and max color.
		let colour00 = [];
		let colour10 = [];
		let colourDiff = [];

		for (var i = 0; i < 3; i++) {
			colour00[i] = parseInt((hiCol[i] - loCol[i]) * delta00 + loCol[i]);
			colour10[i] = parseInt((hiCol[i] - loCol[i]) * delta10 + loCol[i]);
			colourDiff[i] = parseInt((hiCol[i] - loCol[i]) * deltaDiff + loCol[i]);
		}

		district.push(x[0]);
		style00.push(colour00);
		style10.push(colour10);
		styleDiff.push(colourDiff);
	}
	const styleObject = {
		district: district,
		pop00: style00,
		pop10: style10,
		popDiff: styleDiff
	};

	return styleObject
}

async function fetchValues(dataFamily, dataType, year) {

	// Store API url.
	let url = `http://localhost:3000/data/${dataFamily}/${dataType}/${year}`;
	//console.log(`pol: ${pollutant}, year: ${year}, url: ${url}`);

	// Set up variables to store processed values.
	let valMin = Number.MAX_VALUE;
	let valMax = Number.MIN_VALUE;
	let valArr = [];

	// Query API.
	const response = await fetch(url);
	const json = await response.json();

	// Loop through json assigining the locational data and the value data.
	for (var i = 0; i < json.length; i++) {
		let obj = json[i];
		let lat = parseFloat(obj.lat);
		let lon = parseFloat(obj.lon);
		let val = parseFloat(obj.value);
		//console.log(`lat: ${lat}, lon: ${lon}, type: ${typeof(lon)}`);

		// Determine the min and max values
		if (val > valMax) {
			valMax = val;
		}
		if (val < valMin) {
			valMin = val;
		}

		let array = [lat, lon, val];
		valArr.push(array);
	}

	const data = {
		min: valMin,
		max: valMax,
		array: valArr
	}

	return data;
}

function stylePollutionData(minimum, maximum, row) {
	let loCol = [255, 255, 153];
	let hiCol = [255, 80, 80];
	let loSize = 0.005;
	let hiSize = 0.5;
	let loHeight = 1.1;
	let hiHeight = 3;
	//console.log(`row: ${row}`);
	let min = minimum;
	let max = maximum;
	let lat = row[0];
	let lon = row[1];
	let value = row[2];

	//	Delta represents ratio of where the data value sits between min and max.
	let delta = (value - min) / (max - min);

	let latlon = [lat, lon];
	let cartesian = getCoordsFromCenter(mapCenter, latlon);

	let positionX = cartesian.y;
	let positionZ = -cartesian.x;

	//	Assign colour based on ratio between min and max datum, and thus min and max color.
	var colour = [];
	for (var i = 0; i < 3; i++) {
		colour[i] = parseInt((hiCol[i] - loCol[i]) * delta + loCol[i]);
	}

	let size = (hiSize - loSize) * delta + loSize;
	let height = (hiHeight - loHeight) * delta + loHeight;

	let obj = document.createElement('a-entity');

	obj.setAttribute('class', 'pollution');
	obj.setAttribute('geometry', 'primitive: sphere');
	obj.setAttribute('material', { color: `rgb(${colour[0]},${colour[1]}, ${colour[2]})` });
	obj.object3D.position.set(positionX, height, positionZ);
	obj.object3D.scale.set(size, size, size);

	obj.addEventListener('mouseenter', () => {
		console.log("mouse has entered.");
		obj.setAttribute('interaction-on-hover', {
			'alterSize' : true,
			'input': value
		});
	})
	obj.addEventListener('mouseleave' , () => {
		console.log('mouse has left.')
		obj.removeAttribute('interaction-on-hover');
		
	})
	sceneElement.appendChild(obj);
}





//--------- SCRIPTS -------//
// Need to think of a better title for this.

// Get population data.
/*let popPromise = fetchEmbeddedData('population');
// Store in object to access the data later.
let popObj = popPromise.then(value => {
  console.log(`This is the value: ${value}`);
  return value
});*/

// Get subway data.
/*let subwayStations = getPoints('subway-stations');
subwayStations.then(value => {
    let renderStations = renderPoint(value, 'stations', 'box', 'red');
    return renderStations
})*/

// Get NOx pollution data for 2018.
/*let pollNO18 = fetchValues('air-pollution', 'no', 2018);
pollNO18.then(value => {
    for(var x of value.array){
        stylePollutionData(value.min, value.max, x);
    }
}) */


// ------ User Interface ------- //

// Declare the buttons that show additional menus for each type of data.
let pointMenuBtn = document.querySelector('a-button[name=point-menu]');
let embedMenuBtn = document.querySelector('a-button[name=embed-menu]');
let threeMenuBtn = document.querySelector('a-button[name=three-menu]');

// Declare the three sub-menus
let pointMenu = document.getElementById('point-menu');
let embedMenu = document.getElementById('embed-menu');
let threeMenu = document.getElementById('three-menu');

// Declare their visibility to allow simple toggling.
let pointVis = pointMenu.getAttribute('visible');
let embedVis = embedMenu.getAttribute('visible');
let threeVis = threeMenu.getAttribute('visible');


pointMenuBtn.addEventListener('click', () => { 
	let pointVis = pointMenu.getAttribute('visible');
	if(pointVis == false){
		console.log(`point menu visibility is ${pointVis}.`);
		embedMenu.setAttribute('visible', false);
		threeMenu.setAttribute('visible', false);
		pointMenu.setAttribute('visible', true);
		console.log(`point menu visibility is ${pointVis}.`);
	}
})

embedMenuBtn.addEventListener('click', () => {
	let embedVis = embedMenu.getAttribute('visible');
	if(embedVis == false){
		threeMenu.setAttribute('visible', false);
		pointMenu.setAttribute('visible', false);
		embedMenu.setAttribute('visible', true);
	}
})

threeMenuBtn.addEventListener('click', () => { 
	let threeVis = threeMenu.getAttribute('visible');
	if(threeVis == false){
		embedMenu.setAttribute('visible', false);
		pointMenu.setAttribute('visible', false);
		threeMenu.setAttribute('visible', true);
	}
})

// function to get all the radio values from a form.
function getRadio(form, name){
	let value;
	let list= [];
	// Grab list of radio buttons with the specified name.
	let radios = document.querySelectorAll(`#${form} > [name=${name}] `);
	Array.from(radios).forEach( function (el) {
		let checked = el.getAttribute('checked');
		list.push(checked);
		if (checked == 'true'){
			value = el.getAttribute('label');
			//console.log(value);
		}
		
	});
	console.log(list);
	return value;
}

// As there is a bug with the <a-radio> elements (They don't reset the checked status) I need to create
// A click event that resets each other radio in the name + form.

document.querySelectorAll('a-radio').forEach(item => {
	item.addEventListener('click', () => {
		console.log("Clicked");
		// First, get the name of the radio group to allow to manipulate that group.
		let radioName = item.getAttribute('name');
		//item.setAttribute('checked', 'true');
		document.querySelectorAll(`a-radio[name=${radioName}]`).forEach(el => {
			el.setAttribute('checked', 'false');
			//el.setAttribute('radioColor', "#757575");
			//el.setAttribute('radioColorChecked', "#757575");
		})
		item.setAttribute('checked', 'true');
		//item.setAttribute('radioColor', "#4076fd");
		//item.setAttribute('radioColorChecked', "#4076fd");

		document.querySelectorAll(`a-radio[name=${radioName}]`).forEach(ele =>{
			console.log(`id: ${ele.getAttribute('label')}, checked: ${ele.getAttribute('checked')}`);
		})
		//console.log(`This is the radio group that was clicked: ${radioName}`);
	})
})


// ------ Three Menu ------ //
//
// Declare variables for the radio buttons.
let threeRenderBtn = document.querySelector('a-button[name="render-three"]');

// Pollution
let polNO = document.querySelector('a-radio[label=NOx]');
let polO3 = document.querySelector('a-radio[label=O3]');
let polPM = document.getElementById('PM');
let polOff = document.querySelector('a-radio[label=None]');

threeRenderBtn.addEventListener('click', () => {
	let polType;
	let radioValue = getRadio('three-form', 'pollution');
	console.log(`This is the radio value: ${radioValue}`);
	switch (radioValue){
		case 'NOx':
			polType = 'no';
			break;
		case 'O3':
			polType = 'o3';
			break;
		case 'PM2.5':
			polType = 'pm';
	}

	if( radioValue == 'None'){
		if (document.body.contains(document.querySelector("a-entity.pollution"))){
			let entities = document.querySelectorAll("a-entity.pollution");
			let entArr = [...entities]; // Turns node list into array using spread operator.
			entArr.forEach(function(e){
				e.parentNode.removeChild(e);
			});
		}
	}
	else{
		if (document.body.contains(document.querySelector("a-entity.pollution"))){
			let entities = document.querySelectorAll("a-entity.pollution");
			let entArr = [...entities];
			entArr.forEach(function(e){
				e.parentNode.removeChild(e);
			})

			let pollution = fetchValues('air-pollution', polType, 2018);
			pollution.then(value => {
				for(var x of value.array){
					stylePollutionData(value.min, value.max, x);
    			}
			})
		}
		else{
			let pollution = fetchValues('air-pollution', polType, 2018);
			pollution.then(value => {
				for(var x of value.array){
					stylePollutionData(value.min, value.max, x);
    			}
			})
		}
	}
})


// ------ Point Menu ----- //
//
// Declare variables for the radio buttons.
let pointRenderBtn 	= document.querySelector('a-button[name="render-points"]');

let subwayStationCheckbox 	= document.querySelector('a-checkbox[name="subway"]');

pointRenderBtn.addEventListener('click', () => {
	let stationChecked = subwayStationCheckbox.getAttribute('checked');
	if( stationChecked == 'true'){
		//console.log(`Stations are checked`);
		if(document.body.contains(document.querySelector("a-entity.stations"))){
			//console.log(`Station entities exist.`);
		}
		else{
			//console.log(`Station entities do not exist. Fetching data.`);
			getPoints('subway-stations').then(value => {
				let renderStations = renderPoint(value, 'stations', 'box', 'red');
				return renderStations;
			})
		}
	}
	else{
		//console.log(`The stations are not checked.`);
		if(document.body.contains(document.querySelector("a-entity.stations"))){
			//console.log(`Entities exist - Removing.`);
			//console.log(document.querySelectorAll("a-entity.stations"));
			let entities = document.querySelectorAll("a-entity.stations");
			let entArr = [...entities];
			entArr.forEach(function(e){
				e.parentNode.removeChild(e);
			})
		}
	}

})

// ------ Embed Menu ------ //
//
// Declare variables for the radio buttons.
let embedRenderBtn = document.querySelector('a-button[name="render-embed"]');
let popObj;

// Click event listener.
embedRenderBtn.addEventListener('click', () => {
	let popType;
	
	let popVal = getRadio('embed-form', 'population');
	console.log(`This is the radio value: ${popVal}`);

	switch(popVal){
		case '2000':
			popType = 'pop2000';
			break;
		case '2010':
			popType = 'pop2010';
			break;
		case '2000/2010 % Change':
			popType = 'popDiff';
			break;
		case 'None':
			popType = 'None';
	}

	console.log(`popType : ${popType}`);
	if(popObj != undefined){
		console.log(`popObj is declared: setting attribute.`)
		let entities = document.querySelectorAll('a-entity.model');
		let entArr = [...entities];
		entArr.forEach(function(e){
			if(popType == 'None'){
				e.removeAttribute('embed-data');
			}
			else{
				e.removeAttribute('embed-data');
				e.setAttribute('embed-data', popType);
			}
			
		})
	}
	else{
		console.log("population object is empty - Fetching data...");
		let popPromise = fetchEmbeddedData('population');
		popObj = popPromise.then(value => {
			popObj = value;
			console.log(`popObj: ${popObj}`);
			console.log(popObj);

			let entities = document.querySelectorAll('a-entity.model');
			let entArr = [...entities];
			console.log(`entities: ${entArr}`);
			console.log(entArr);
			entArr.forEach(function(e){
			if(popType == 'None'){
				e.removeAttribute('embed-data');
			}
			else{
				e.removeAttribute('embed-data');
				e.setAttribute('embed-data', popType);
			}
			
		});
			return value
		})
		
	}
})