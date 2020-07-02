// Node.js API server for the web-urban analytics app.
// Author: Harvey Reynier
// Description: FILL ME.
// Modules: Express, ejs, path.

//  Setup the express server + global module constants.
const express   = require('express');
const app       = express();
const port      = 3000;
const path      = require('path');

app.set('view engine', 'ejs');
//  Provides the static folders we have added in the project to the web server.
app.use(express.static(__dirname + '/js'))
app.use(express.static(__dirname + '/css'));
//app.use(express.static(__dirname + '/images'));
app.use(express.static(__dirname + '/data'));


//  API GET ENDPOINTS
// Default -- Returns the index.ejs landing / docu page.
app.get('/', function(req, res) {
    return res.render('index');
})


// Returns json/geojson of NYC subway stations.
app.get('/data/subway-stations', function(req, res){

    //  Allows data to be downloaded from the server with security concerns.
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-WithD");

    // Define local path to access locally stored data.
    let options = {
        root: path.join(__dirname, '/data')
    };

    console.log("/data/subway-stations . . . Sending data.")
    res.sendFile('Stations.json', options ,function (err){
        if (err)    {
            console.log(err);
        }   else    {
            console.log("Sent: Camden Ward Boundaries");
        }
    });
})


// Setup the server and print a string to the screen when server is ready.
var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('App listening at http://%s:%s', host, port);
})