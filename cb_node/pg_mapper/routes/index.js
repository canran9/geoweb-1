var express = require('express'); // require Express
var router = express.Router(); // setup usage of the Express router engine

/* PostgreSQL and PostGIS module and connection setup */
const { Client, Query } = require('pg')

// Setup connection
var username = "user" // sandbox username
var password = "password" // read only privileges on our table
var host = "localhost:5432"
var database = "geoweb" // database name
var conString = "postgres://"+username+":"+password+"@"+host+"/"+database; // Your Database Connection

// Set up your database query to display GeoJSON
var coffee_query = "SELECT ST_AsGeoJSON(location) FROM landmark";

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
    	console.log(result.rows[0]);
        res.send(result.rows[0]);
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
        console.log(data);
        res.render('map', {
            title: "Express API", // Give a title to our page
            jsonData: data // Pass data to the View
        });
    });
});

module.exports = router;