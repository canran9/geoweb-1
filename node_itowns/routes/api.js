require('dotenv').config();
var express = require('express');
var router = express.Router();
const path = require('path');
/* PostgreSQL and PostGIS module and connection setup */
const { Client, Query } = require('pg')

/* GET Postgres JSON data */
router.get('/landmarks', function (req, res) {
    // Connect to DB
    const client = new Client(process.env.DATABASE_URL);
    client.connect();

    // Query DB
    // var geo_query = "SELECT ST_AsGeoJSON(location) FROM landmark";
    // Set up database query to display GeoJSON: points are displayed as polygon
    var geo_query = `SELECT row_to_json(fc) FROM ( 
        SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features 
        FROM (
            SELECT 
                'Feature' As type, 
                ST_AsGeoJSON(ST_Buffer(location,50))::json As geometry, 
                row_to_json((id,libelle)) As properties 
            FROM landmark As lg
        ) As f) 
    As fc
    `;
    const query = client.query(new Query(geo_query));

    // Get results and send them
    query.on("row", function (row, result) {
        result.addRow(row);
    });
    query.on("end", function (result) {
        res.send(result.rows[0].row_to_json);
        res.end();
    });
});

module.exports = router;
