mapboxgl.accessToken = 'pk.eyJ1IjoibW9uZ2kwNSIsImEiOiJjazZ2enM4MW4wMm12M3FqenRkYjN1aDRsIn0.o6TooUV3QFrWTwO2w24AEw';
var map = new mapboxgl.Map({
    container: 'map',
    zoom: 9,
    center: [-1.5534, 47.21731],
    style: 'mapbox://styles/mapbox/satellite-v9'
});

map.on('load', function() {
    map.loadImage('/images/landmark.ico',
        function(error, image) {
            if (error) throw error;
            map.addImage('cat', image);
            map.addSource('point', {
                type: 'geojson',
                data: 'http://localhost:3000/api/landmarks'
            });
            map.addLayer({
                'id': 'points',
                'type': 'symbol',
                'source': 'point',
                'layout': {
                    'icon-image': 'cat',
                    'icon-size': 0.05
                    }
            });
        }
    );
});