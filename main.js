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
const mapCenter    = [-73.953294, 40.756234];

// Declare global arrays + objects
let station_object = [];
let pollutionObject;



// Declare functions
function getCoordsFromCenter(centerCoordinates, nextCoordinates){
  // Declare center XY coordinate object.
  const centerXY = {x: 0, y: 0}

  // Calculate bearing (degrees) and distance between two lat/lon pairs.
  let coordBearing  = turf.bearing(centerCoordinates, nextCoordinates);
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

// jQuery Script - Requires DOM to load.
$(document).ready(function()  {
  let sceneElement = document.querySelector('a-scene');
  
  // Stations Data
  function getStations(){
    let url = "http://localhost:3000/data/subway-stations";
    console.log(`API Endpoint: ${url}`);

    $.getJSON(url, function(data){
      // Declare variables
      let latitude;
      let longitude;
      let point;
      let station;

      // Loop through each row.
      $.each(data, function(key, value){
        console.log(`Row Number: ${key}, Value: ${value}`);
        if(key == 'data'){
          $.each(value, function(id, val){
            point   = val[11];
            station = val[10];
            console.log(`Station: ${station}`);
            point = point.replace(/[^0-9.+-\s]/g,''); //String RegExp
            point = point.split(' ');
            latitude = parseFloat(point[2]);
            longitude = parseFloat(point[1]);
            
            //console.log(`Lat Type: ${typeof(latitude)}, Lon Type: ${typeof(longitude)}`);
            console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

            let lonlat = [longitude, latitude];

            let cartesian = getCoordsFromCenter(mapCenter, lonlat)

            let positionX = cartesian.y;
            let positionZ = -cartesian.x;
            console.log(`AFrame Z Position: ${positionZ}, AFrame X Position: ${positionX}`);

            
            /*let aframeLat = -((latitude-40)*100);
            let aframeLon = ((longitude+73)*100);
            console.log(`AFrame Lat: ${aframeLat}, AFrame Lon: ${aframeLon}`);*/

            station = document.createElement('a-box');
            station.setAttribute('material', {color: 'red'});
            station.setAttribute('position', {x: positionX, y: 0, z: positionZ});
            station.setAttribute('scale', {x: 0.02, y: 5, z: 0.02});
            sceneElement.appendChild(station);

          })
        }
      })
    })
  }

  async function fetchPollution(pollutant, year){
    let url = `http://localhost:3000/data/air-pollution/${pollutant}/${year}`;
    //console.log(`pol: ${pollutant}, year: ${year}, url: ${url}`);
    let polMin = Number.MAX_VALUE;
    let polMax = Number.MIN_VALUE;
    let pollArr        = [];
    const response = await fetch(url);
    const json = await response.json();
    
    for(var i=0; i < json.length; i++){
        let obj = json[i];
        let lat = parseFloat(obj.lat);
        let lon = parseFloat(obj.lon);
        let val = parseFloat(obj.value);
        //console.log(`lat: ${lat}, lon: ${lon}, type: ${typeof(lon)}`);
        if(val > polMax){
            polMax = val;
        }
        if(val < polMin){
            polMin = val;
        }
        
        let array = [lat, lon, val];
        pollArr.push(array);
    }
    const pollution = {
        min: polMin,
        max: polMax,
        data: pollArr
    }
    for(var x of pollution.data){
        stylePollution(pollution.min, pollution.max, x);
    }

    return pollution;
  }

  function stylePollution(minimum, maximum, row){
    let loCol  = [255,255,153];
    let hiCol  = [255,80,80];
    let loSize = 0.01;
    let hiSize = 0.5;
    let loHeight = 1.1;
    let hiHeight = 3;
    //console.log(`row: ${row}`);
    let min   = minimum;
    let max   = maximum;
    let lat   = row[0];
    let lon   = row[1];
    let value = row[2];

    //	Delta represents ratio of where the data value sits between min and max.
    let delta = (value - min) / (max - min);

    let latlon = [lat,lon];
    let cartesian = getCoordsFromCenter(mapCenter, latlon);

    let positionX = cartesian.y;
    let positionZ = -cartesian.x;

    //	Assign colour based on ratio between min and max datum, and thus min and max color.
    var colour = [];
    for ( var i = 0; i < 3; i++ ) {
      colour[i] = parseInt((hiCol[i] - loCol[i]) * delta + loCol[i]);
    }

    let size = (hiSize-loSize)* delta + loSize;
    let height = (hiHeight - loHeight) * delta + loHeight;

    let obj = document.createElement('a-sphere');
    obj.setAttribute('material', {color: `rgb(${colour[0]},${colour[1]}, ${colour[2]})`});
    obj.object3D.position.set(positionX, height, positionZ);
    obj.object3D.scale.set(size, size, size);
    sceneElement.appendChild(obj);
  }

  // Function to get air pollution.
  /*function getPollution(pollutant, year){
    let url = `http://localhost:3000/data/air-pollution/${pollutant}/${year}`;
    //console.log(`API Endpoint: ${url}`);

    $.getJSON(url, function(data){
      // Declare variables
      let latitude;
      let longitude;
      let pol;
      let polMin = Number.MAX_VALUE;
      let polMax = Number.MIN_VALUE;
      let pollArr        = [];

      // Loop through each row.
      $.each(data, function(key, val){
        latitude  = parseFloat(val.lat);
        longitude = parseFloat(val.lon);
        pol       = parseFloat(val.value);

        let array = [latitude, longitude, pol];

        if(pol > polMax){
          polMax = pol;
        }
        if(pol < polMin){
          polMin = pol;
        }
        pollArr.push(array);
      })

      const pollution = {
        min: polMin,
        max: polMax,
        value: pollArr
      }
      console.log(pollution);
      return pollution
    })
  }

  async function stylePollution(pollutant, year){
    let loCol  = [49,70,54];
    let hiCol  = [118,41,51];
    let loSize = 0.01;
    let hiSize = 1;
    let loHeight = 1.1;
    let hiHeight = 3;

    if(pollutionObject === undefined){
      pollutionObject = await fetchPollution(pollutant, year);

      let min = pollutionObject.min;
      let max = pollutionObject.max;
      let array = pollutionObject.pollArr;

      for(var x of array){
        let lat = x[1];
        let lon = x[2];
        let val = x[3];
        let latlon = [lat,lon];
        let cartesian = getCoordsFromCenter(mapCenter, latlon);

        let positionX = cartesian.y;
        let positionZ = -cartesian.x;

        //	Delta represents ratio of where the data value sits between min and max.
        let delta = (val - min) / (max - min);

        //	Assign colour based on ratio between min and max datum, and thus min and max color.
        var colour = [];
        for ( var i = 0; i < 3; i++ ) {
          colour[i] = (hiCol[i] - loCol[i]) * delta + loCol[i];
        }

        let size = (hiSize-loSize)* delta + loSize;
        let height = (hiHeight - loHeight) * delta + loHeight;



        let obj = document.createElement('a-sphere');
        obj.setAttribute('material', {color: `hsl(${colour})`});
        obj.object3D.position.set(positionX, height,positionZ);
        obj.object3D.scale.set(size, size, size);
        sceneElement.appendChild(obj);
      }

    }
    else{
    }
  }*/
  // AFrame Components -> move to separaete js file in header.

  //getStations()
  //getPollution("no", 2018);
  //stylePollution("no", 2018);

  let polObject;
  let polPromise = fetchPollution('no', 2018);
  // Store in object to access the data later.
  let polData = polPromise.then(function(object){
    console.log(object);
    polObject = object;
    return
  });




  /*
  console.log(`Lat: ${latitude}, lon: ${longitude}, pol: ${pol}`);

        let latlon = [latitude, longitude];

        let cartesian = getCoordsFromCenter(mapCenter, latlon)

        let positionX = cartesian.y;
        let positionZ = -cartesian.x;
        console.log(`AFrame Z Position: ${positionZ}, AFrame X Position: ${positionX}`);

        let pollution = document.createElement('a-sphere');
        pollution.setAttribute('material', {color: 'blue'});
        pollution.setAttribute('position', {x: positionX, y: 2, z: positionZ});
        pollution.setAttribute('scale', {x:0.1, y:0.1, z:0.1});
        sceneElement.appendChild(pollution);
  */
  
})




// Stations data.
/*fetch('http://localhost:3000/data/subway-stations')
  .then((response) => {
    return response.json()
  })
  .then((data) => {
    data.forEach(obj => {
      Object.entries(obj).forEach(([key, value]) => {
        console.log(`${key} ${value}`);
      });  
    console.log('----------');
  });
  })
  .catch((err) => {
    console.log(err);
  })*/

