// - Data Collection + Processing - //
// ---- AUTHOR: Harvey Reynier --- //
// ------- DESCRIPTION ------- //


// DESCRIPTION GOES HERE.
//

// Declare globals
let station_object = [];
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
            let aframeLat = -((latitude-40)*100);
            let aframeLon = ((longitude+73)*100);
            console.log(`AFrame Lat: ${aframeLat}, AFrame Lon: ${aframeLon}`);

            station = document.createElement('a-box');
            station.setAttribute('material', {color: 'red'});
            station.setAttribute('position', {x: aframeLon, y: 1, z: aframeLat});
            station.setAttribute('scale', {x: 1, y: 5, z: 1});
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

