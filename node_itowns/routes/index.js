var express = require('express'); // require Express
var router = express.Router(); // setup usage of the Express router engine
var Twig = require("twig");

/* PostgreSQL and PostGIS module and connection setup */
const { Client, Query } = require('pg')
const path = require('path');

// Setup connection
var username = "user" // sandbox username
var password = "password" // read only privileges on our table
var host = "localhost:5432"
var database = "geoweb" // database name
var conString = "postgres://"+username+":"+password+"@"+host+"/"+database; // Your Database Connection

// Set up your database query to display GeoJSON
var coffee_query = `SELECT row_to_json(fc) FROM ( 
                        SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features 
                        FROM (
                            SELECT 
                                'Feature' As type, 
                                ST_AsGeoJSON(ST_Buffer(location,200))::json As geometry, 
                                row_to_json((id,libelle)) As properties 
                            FROM landmark As lg
                        ) As f) 
                    As fc
                    `;

//var coffee_query = "SELECT ST_AsGeoJSON(location) FROM landmark";

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET Postgres JSON data */
router.get('/data', function (req, res) {
    var client = new Client(conString);
    client.connect();
    var query = client.query(new Query(coffee_query));
    query.on("row", function (row, result) {
        result.addRow(row);
    });
    query.on("end", function (result) {
        res.send(result.rows[0].row_to_json);
        res.end();
    });
});

/* GET the map page */
router.get('/map', function(req, res) {
    var client = new Client(conString); // Setup our Postgres Client
    client.connect(); // connect to the client
    var query = client.query(new Query(coffee_query)); // Run our Query
    query.on("row", function (row, result) {
        result.addRow(row);
    });
    // Pass the result to the map page
    query.on("end", function (result) {
        var data = [
    				JSON.parse(result.rows[0].st_asgeojson),
    				JSON.parse(result.rows[1].st_asgeojson)
				]; // Save the JSON as variable data
        //res.render('map');
        res.sendFile(path.join(__dirname+'/../views/map.html'));
    });

});

/* GET the nantes page */
router.get('/nantes', function(req, res) {
    var client = new Client(conString); // Setup our Postgres Client
    client.connect(); // connect to the client
    var query = client.query(new Query(coffee_query)); // Run our Query
    query.on("row", function (row, result) {
        result.addRow(row);
    });
    // Pass the result to the map page
    query.on("end", function (result) {
        res.render(path.join(__dirname+'/../views/nantes.html.twig'),{data: result.rows[0].row_to_json});
    });

});

router.get('/javscripts/itowns.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/itowns/dist/itowns.js');
});


module.exports = router;