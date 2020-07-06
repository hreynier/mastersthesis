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
let station_object = [];
const mapCenter    = [-73.953294, 40.756234];

// Declare functions

function getCoordsFromCenter(centerCoordinates, nextCoordinates){
  // Declare center XY coordinate object.
  let centerXY = {x: 0, y: 0}

  // Calculate bearing (degrees) and distance between two lat/lon pairs.
  let coordBearing  = turf.bearing(centerCoordinates, nextCoordinates);
  let coordDistance = turf.distance(centerCoordinates, nextCoordinates);

  // Calculate XY, through solving a cartesian 2D coordinate problem. Unit is taken as 100m, change the '* 10' to change the scale.
  // See link for more: https://gis.stackexchange.com/questions/353701/converting-latitude-and-longitude-to-xy-coordinates
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
            
            console.log(`Lat Type: ${typeof(latitude)}, Lon Type: ${typeof(longitude)}`);
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

  getStations()
  
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

