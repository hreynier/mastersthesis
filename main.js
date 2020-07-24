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

	return population;
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
	obj.setAttribute('delta', delta);
	obj.setAttribute('value', value);


	// Get the legend marker and its og position.
	let marker = document.getElementById('pollution-marker');
	let oldPos = marker.getAttribute('position');
	oldPos = oldPos.y;



	obj.addEventListener('mouseenter', () => {
		console.log("mouse has entered.");
		obj.setAttribute('interaction-on-hover', {
			'alterSize' : true,
			'input': value
		});

		// Move marker according to ratio.
		marker.setAttribute('legend-marker-value', {
			'input' : value,
			'side' : 'left'
		});
	
		// HARD CODED length of legend.
		let length = 11 * 0.03;

		// new position according to ratio (delta) in dataset.
		let newPos  = ( ( delta * length) + oldPos);
		marker.object3D.position.set(0, newPos, 0);


	})
	obj.addEventListener('mouseleave' , () => {
		console.log('mouse has left.')
		obj.removeAttribute('interaction-on-hover');

		// remove marker value and reset to og position.
		marker.removeAttribute('legend-marker-value');
    	marker.object3D.position.set(0, oldPos, 0);
		
	})
	sceneElement.appendChild(obj);
}

//

function createLegend(textObject, side, colorObject, id){
    /*  Creates an interactive legend in A-Frame, with customisation based on 
        input parameters.
        
        Text Object = {
            title: 'string',
            subtitle: 'string',
            min: 'float/int',
            max: 'float/int'
        }
        Title & Subtitle are both strings, which will be rendered as the legends title
        / subtitle. Representing the dataset and units for example.
        
        Side indicates the position of the legend.
        
        colorObject is an object formatted,
         {topColor: [R,G,B], bottomColor: [R,G,B], Steps: Integer}
        This utilises the colorGradient function to return an array, of length according to steps,
        containing the RGB values for a gradient from the bottom color to the top color.

        The data object is the data that should be represented in the legend.

        id is the id for the element.
    */
    
    // NEED TO ADD REQUIRE AFRAME TO ENSURE FUNCTION ONLY RUNS IF AFRAME IS LOADED.

    // TO MAKE FULLY GENERIC/ABSTRACT NEED TO TAKE INTO ACCOUNT VARYING STEP SIZES,
    // NOT JUST '10'.

	console.log("creating legend...");
	// Declare variables.
    let sceneElement = document.querySelector('a-scene');
    let cameraElement = document.querySelector('[camera]');

    // Blank inputs. NEED TO ADD IF USER DOES NOT ENTER CERTAIN INPUTS.
    

    // Calculate + return the color gradient array.
	let gradient = colorGradient(colorObject.topColor, colorObject.bottomColor, colorObject.steps);
	console.log('returning gradient...');
	console.log(gradient);


    // Create parent object for legend.
    let legendParent = {};
    // position X value for background element.
    let bgX;
    // position X value for text elements.
    let txtX;
    let minX;

	// Declare x/z A-Frame positions according to 'side' parameter.
	console.log('checking side parameter...')
    switch (side){
        case 'left':
            legendParent.x = -0.6;
            legendParent.z = -0.47;
            bgX = -0.007;
            txtX = -0.065;
            minX = 0.02;
            
        break;
        case 'right':
            legendParent.x = 0.6;
            legendParent.z = -0.47;
            bgX = 0.007;
            txtX = -0.12;
            minX = -0.11;
    }
	console.log(`side: ${side}, posX: ${legendParent.x}`, );

    // Create parent entity - assign position based on above.
    let parent = document.createElement('a-entity');
    parent.object3D.position.set(legendParent.x, 0, legendParent.z);
    parent.setAttribute('id', `${id}-legend`);
    parent.setAttribute('material', {shader: 'flat'}); // Stops legend from being affected by lighting - increases clarity + performance.


    // ----- LEGEND COLOURS ----- //
    // Set gradient entity parameters.
    let gradElSize = 0.03; //Assuming desired shape is square not rectangle.
    
    // Grab step parameter and step unit to determine position of entity later.
    let stepsTotal = parseInt(colorObject.steps,10);
    let stepSize   = 1 / stepsTotal;
    let length = stepsTotal * gradElSize;

    // Loop through gradient array and create gradient-legend entities accordingly.
    for(var i=0; i < gradient.length; i++){
        console.log(`i: ${i}, col: ${gradient[i]}`);
        // Grab colour from gradient array.
        let colour = gradient[i];

        // Calculate ratio of where entity is along position.
        let posRatio = stepSize * i;
        let position = posRatio * length;
        let posY     = (-length/2) + position; // divided by two as legend is centered around y = 0.
        

        // Create gradient element.
        let gradientEl = document.createElement('a-plane');
        // Set size (smol square).
        gradientEl.setAttribute('geometry', {width: gradElSize, height: gradElSize});
        // Set colour.
        gradientEl.setAttribute('material', { color: `rgb(${colour[0]}, ${colour[1]}, ${colour[2]})`});
        // Set position.
        gradientEl.object3D.position.set(0, posY, 0);
        // Stops legend from being affected by lighting - increases clarity + performance.
        gradientEl.setAttribute('material', {shader: 'flat'});

        // Append to parent entity.
        parent.appendChild(gradientEl);
    }

    // ----- MARKER ----- //    
    // Create the marker entity.
    let marker = document.createElement('a-entity');

    // Set basic attributes.
    marker.setAttribute('geometry', 'primitive: box');
    marker.setAttribute('material', { color: '#787469'});
    marker.setAttribute('geometry', {width: (gradElSize-0.01), height: (gradElSize-0.01), depth: 0.001});
    marker.setAttribute('material', {shader: 'flat'});
    
    // Set position
    // Calculate the minimum position according to the gradient elements dimensions.
    let markerY = - (length/2) - (gradElSize/2);
    marker.object3D.position.set(0, markerY ,0);

    // Set rotation to create diamond shape.
    let markerRotation = THREE.Math.degToRad(45)
    marker.object3D.rotation.z = (markerRotation);

    // Set marker id to allow for interaction outside of function.
    // Through DOM manipulation. (?)
    marker.setAttribute('id', `${id}-marker`);
    //console.log(`marker id: ${marker.getAttribute('id')}`);

    parent.appendChild(marker);

    // ---- LEGEND FRAME ---- //

    // Create legend frame object to incrase legend + marker clarity for certain colour combinations.
    let legendFrame = document.createElement('a-plane');
    
    // Set basic attributes.
    legendFrame.setAttribute('material', { color: 'black'});
    let lgdFrmWdt = (gradElSize + 0.01);
    let lgdFrmHgt = ((gradElSize * 2) + length);
    legendFrame.setAttribute('geometry', {width: lgdFrmWdt, height: lgdFrmHgt});
    legendFrame.object3D.position.set(bgX, 0, -0.005);

    // Append
    parent.appendChild(legendFrame);

    // ---- TITLE + SUBTITLE + TXT ---- //

    // Parse the title + subtitle values into two <a-text> entities and place them above the legend (leaving space.)
    // Add black <a-plane> bg to them.
    // Add max + min values? (possibly need to change the parameters to (TXT input)).

    // Declare title, subtitle, min, max values from input object.
    let title = textObject.title;
    let subtitle = textObject.subtitle;
    let min = textObject.min;
    let max = textObject.max;

    // Create text elements for each.
    let titleEl = document.createElement('a-text');
    let subtitEl= document.createElement('a-text');
    let minEl   = document.createElement('a-text');
    let maxEl   = document.createElement('a-text');
    
    // Set basic attributes + position for each.
    
    // Title
    titleEl.setAttribute('color', 'black');
    titleEl.setAttribute('width', 0.5 );
    let titleY = ( ( lgdFrmHgt / 2 ) + ( 1.2 * gradElSize ) );
    titleEl.object3D.position.set(txtX, titleY,0);
    titleEl.setAttribute('value', title);

    // Subtitle
    subtitEl.setAttribute('color','black')
    subtitEl.setAttribute('width', 0.3);
    let subtitY = ( titleY - ( 0.75 * gradElSize ) );
    subtitEl.object3D.position.set(txtX , subtitY, 0);
    subtitEl.setAttribute('value', subtitle);

    // Min
    minEl.setAttribute('color', 'black');
    minEl.setAttribute('width', 0.4 );
    let minY = - ( (lgdFrmHgt / 2 ) - (gradElSize / 2));
    
    minEl.object3D.position.set(minX, minY, 0);
    minEl.setAttribute('value', `Min: ${min}`);

    // Max
    maxEl.setAttribute('color', 'black');
    maxEl.setAttribute('width', 0.4 );
    let maxY = - minY;
    maxEl.object3D.position.set(minX, maxY, 0);
    maxEl.setAttribute('value', `Max: ${max}`);

    // Append as children to parent element.
    parent.appendChild(titleEl);
    parent.appendChild(subtitEl);
    parent.appendChild(minEl);
    parent.appendChild(maxEl);



    cameraElement.appendChild(parent);
}

function colorGradient(topColor, bottomColor, steps){
    /*  Given two RGB colours (provided as [arrays]), create and output
        an array of intermediary colours with a length
        equal to the steps specified.
    */
    // Empty Array for output
    let gradient = [];

    // Parse the steps as number to base 10.
    let stepsInt = parseInt(steps, 10);

    // Percentage representation of the given steps. DEPRECATED.
    let stepPerc = 100 / (stepsInt + 1);

    // Decimal representation of each step.
    let stepUnit = 1 / stepsInt;

    // Calc the difference between each colour.

    let diffRGB = [
        topColor[0] - bottomColor[0],
        topColor[1] - bottomColor[1],
        topColor[2] - bottomColor[2]
    ];

    // Loop through each step/colour in gradient. 
    // Calculate the RGB values based on difference + current step unit.
    for(var i=0; i < (stepsInt+1); i++){
        let col = [];

        let delta = i * stepUnit;
        //console.log(`Index: ${i}, Delta: ${delta}`);

        for (var j = 0; j < 3; j++){
            col[j] = parseInt((diffRGB[j]) * delta + bottomColor[j]);
        }

        // Push color to gradient.
        
        gradient.push(col);
    }

    // Return the final gradient object.


    return gradient
}

// ------- CLASSES ------- //

// Gradient object for creating linear color gradient arrays with
// the colorGradient() function.
class Gradient {
	constructor(topColor, bottomColor, steps) {
		this.topColor 		= topColor;
		this.bottomColor 	= bottomColor;
		this.steps 			= steps;
	}
}

// LegendLabels object for labelling the custom legend using the 
// createLegend() function.
class LegendLabels {
	constructor(title, subtitle, min, max) {
		this.title 		= title;
		this.subtitle 	= subtitle;
		this.min 		= min;
		this.max 		= max;
	}
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

// ------ Color Schemes for Legends ----- //

// Yellow -> Red (used in pollution bubbles.)
let yellow 	= [255, 255, 153];
let red 	= [255, 80, 80];
let stepNo 	= 10;

let ylwRed 	= new Gradient(red, yellow, stepNo);
console.log(`ylwRed object:`);
console.log(ylwRed);
console.log(ylwRed.bottomColor);

let ylwrdGradient = colorGradient(ylwRed.topColor, ylwRed.bottomColor, ylwRed.steps);

// White -> Blue (used in embedded population data.)
let white 	= [222, 235, 247];
let blue 	= [50, 134, 195];

let whtBlu	= new Gradient(white, blue, stepNo);

let wtbluGradient 	= colorGradient(whtBlu.topColor, whtBlu.bottomColor, whtBlu.steps);

// CREATE MORE GRADIENTS HERE.



// ------ Three Menu ------ //
//
// Declare variables for the radio buttons.
let threeRenderBtn = document.querySelector('a-button[name="render-three"]');

// Pollution

// Get the radio buttion elements for each pollution type.
let polNO = document.querySelector('a-radio[label=NOx]');
let polO3 = document.querySelector('a-radio[label=O3]');
let polPM = document.getElementById('PM');
let polOff = document.querySelector('a-radio[label=None]');

// Add event listener to the 'Render Button'
// This will allow us to fetch the necessary data + render it alongside UI elements.
threeRenderBtn.addEventListener('click', () => {

	// Declare variables to store the values of the radio button.
	let polType;

	// Get the value of the radio button using the getRadio function declared earlier.
	let radioValue = getRadio('three-form', 'pollution');

	// Log it for debugging purposes.
	console.log(`This is the radio value: ${radioValue}`);

	// Create variables for the switch expression.
	// These store the values for legend entity that will be created later
	// , based on the radio input.
	let title;
	let subtitle;

	// Switch expression for radio value (pollution).
	switch (radioValue){
		case 'NOx':
			polType = 'no';
			title = 'Annual Avg Nitric Oxide';
			subtitle = 'Dec 2017-Dec 2018, (ppb)';
			break;
		case 'O3':
			polType = 'o3';
			title = 'Summer Avg Ozone';
			subtitle = 'Jun - Aug 2018, (ppb)';
			break;
		case 'PM2.5':
			polType = 'pm';
			title = 'Annual Avg fine \n particulate matter';
			subtitle = 'Dec 2017-Dec 2018, (ug/m3)';
	}

	// If the radio value for pollution is set to 'None' query document for
	// any associated entities and if they exist remove them.
	// if not just continue.

	if( radioValue == 'None'){
		if (document.body.contains(document.querySelector("a-entity.pollution"))){

			// Get all instances of 'pollution' entities.
			let entities = document.querySelectorAll("a-entity.pollution");
			let entArr = [...entities]; // Turns node list into array using spread operator.
			entArr.forEach(function(e){
				e.parentNode.removeChild(e);
			});


			// Grab the legend entity for pollution and remove from scene.
			let legend = document.getElementById('pollution-legend');
			legend.parentNode.removeChild(legend);
		}
	}

	// If the radio value for pollution is NOT 'None', check if any entities exist already. If so, 
	// remove them and call the render function again.
	// This can be improved by checking whether the new type
	// is the same as the old type to prevent unnecessary re-fetching + re-rendering
	// of data + entities.
	else{
		if (document.body.contains(document.querySelector("a-entity.pollution"))){

			// Get all instances of 'pollution' entities, and remove.
			let entities = document.querySelectorAll("a-entity.pollution");
			let entArr = [...entities];
			entArr.forEach(function(e){
				e.parentNode.removeChild(e);
			})

			// Grab the legend entity for pollution and remove from scene.
			let legend = document.getElementById('pollution-legend');
			legend.parentNode.removeChild(legend);


			// After scene has been reset - fetch new data and re-render using the style functions.
			let pollution = fetchValues('air-pollution', polType, 2018);

			// After promise is resolved (and data is received), render data + legend.
			pollution.then(value => {

				// First, generate new lables objects from resolved promise' value.
				let legendText = new LegendLabels(title, subtitle, value.min, value.max);

				// Create a new legend entity using the label object and color object previously generated
				// (and matching the colors of the rendered data.)
				// It's important to create the legend first as the rendered points 
				// interacts with the legend.
				createLegend(legendText, 'left', ylwRed, 'pollution'); //Left-oriented legend, with id = 'pollution-legend';
				
				// Now we can loop through data array and render the bubbles.
				for(var x of value.array){
					stylePollutionData(value.min, value.max, x);
				}
			})
		}

		// If there were no other pollution entities present, fetch the data and render as usual.
		else{
			let pollution = fetchValues('air-pollution', polType, 2018);
			pollution.then(value => {

				let legendText = new LegendLabels(title, subtitle, value.min, value.max);
				createLegend(legendText, 'left', ylwRed, 'pollution');
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
		popPromise.then(value => {
			popObj = colourEmbedded(value);
			// NEEED TO CHANGE THIS ALL TO GRAB THE PROCESSED DATA BEFORE STYLING HERE RATHER IN FUNCTION.
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