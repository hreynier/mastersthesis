// - Data Collection + Processing - //
// ---- AUTHOR: Harvey Reynier --- //
// ------- DESCRIPTION ------- //

// DESCRIPTION GOES HERE.

// Stations data.
fetch('http://localhost:3000/data/subway-stations')
  .then((response) => {
    return response.json()
  })
  .then((data) => {
    
    console.log(data);
  })
  .catch((err) => {
    console.log(err);
  })

