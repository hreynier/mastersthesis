// Node.js API server for the web-urban analytics app.
// Author: Harvey Reynier
// Description: FILL ME.

//  Setup the express server.
const express   = require('express');
const app       = express();
const port      = 3000;
app.set('view engine', 'ejs');

//  Provides the static folders we have added in the project to the web server.
app.use(express.static(__dirname + '/js'))
app.use(express.static(__dirname + '/css'));
//app.use(express.static(__dirname + '/images'));
app.use(express.static(__dirname + '/data'));

//Default API Endpoint - returns the index.ejs landing / docu page.
app.get('/', function(req, res) {
    return res.render('index');
})


// Setup the server and print a string to the screen when server is ready.
var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('App listening at http://%s:%s', host, port);
})