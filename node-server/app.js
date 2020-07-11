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

// Returns json of predicted annual average Nitric oxide across manhattan, Dec 2017-Dec 2018 - This is given as a point value
// every 300m. This has been adapted from a raster supplied by the open NYC database.
app.get('/data/air-pollution/:pollutant/:year', function(req, res){

    //  Allows data to be downloaded from the server with security concerns.
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-WithD");
    // If all the variables are provided, continue with GET request.
    if(req.params.pollutant != "" && req.params.year != ""){
        // Parse variables
        let pollutant = req.params.pollutant;
        let year = parseFloat(req.params.year);
        let yr;

        // Define local path to access locally stored data.
        let options = {
            root: path.join(__dirname, '/data')
        };

        // Switch expresssion for year.
        switch(year){
            case 2009:
                yr = 1;
                break;
            case 2010:
                yr = 2;
                break;
            case 2011:
                yr = 3;
                break;
            case 2012:
                yr = 4;
                break;
            case 2013:
                yr = 5;
                break;
            case 2014:
                yr=6;
                break;
            case 2015:
                yr=7;
                break;
            case 2016:
                yr=8;
                break;
            case 2017:
                yr=9;
                break;
            case 2018:
                yr=10;
        }

        let file = `aa${yr}_${pollutant}.json`;

        console.log(`Sending data from file: ${file}`);
        res.sendFile(file, options ,function (err){
            if (err)    {
                console.log(err);
            }   else    {
                console.log(`Data Sent: ${file}`);
            }
        });
    }
})


// Setup the server and print a string to the screen when server is ready.
var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('App listening at http://%s:%s', host, port);
})