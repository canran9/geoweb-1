 // Define initial camera position
            var placement = {
                coord: new itowns.Coordinates('EPSG:4326', -1.5534, 47.2173),
                range: 70000,
            }

            // `viewerDiv` will contain iTowns' rendering area (`<canvas>`)
            var viewerDiv = document.getElementById('viewerDiv');

            // Instanciate iTowns GlobeView*
            var view = new itowns.GlobeView(viewerDiv, placement);
            var menuGlobe = new GuiTools('menuDiv', view);

            // Add one imagery layer to the scene
            // This layer is defined in a json file but it could be defined as a plain js
            // object. See Layer* for more info.
            itowns.Fetcher.json('/itowns/layers/Ortho.json').then(function _(config) {
                config.source = new itowns.WMTSSource(config.source);
                var layer = new itowns.ColorLayer('Ortho', config);
                view.addLayer(layer).then(menuGlobe.addLayerGUI.bind(menuGlobe));
            });

            // Add two elevation layers.
            // These will deform iTowns globe geometry to represent terrain elevation.
            function addElevationLayerFromConfig(config) {
                config.source = new itowns.WMTSSource(config.source);
                var layer = new itowns.ElevationLayer(config.id, config);
                view.addLayer(layer).then(menuGlobe.addLayerGUI.bind(menuGlobe));
            }
            itowns.Fetcher.json('/itowns/layers/WORLD_DTM.json').then(addElevationLayerFromConfig);
            itowns.Fetcher.json('/itowns/layers/IGN_MNT_HIGHRES.json').then(addElevationLayerFromConfig);
            
            var optionsGeoJsonParser = {
                        buildExtent: true,
                        crsIn: 'EPSG:4326',
                        crsOut: view.tileLayer.extent.crs,
                        mergeFeatures: true,
                        withNormal: false,
                        withAltitude: false,
            };

            // Convert by iTowns
            itowns.Fetcher.json('http://localhost:3000/api/landmarks')
                .then(function _(geojson) {
                    return itowns.GeoJsonParser.parse(geojson, optionsGeoJsonParser);
                }).then(function _(parsedData) {
                    var ariegeSource = new itowns.FileSource({
                        parsedData,
                    });

                    var ariegeLayer = new itowns.ColorLayer('ariege', {
                        name: 'ariege',
                        transparent: true,
                        style: {
                            fill: {
                              color: 'orange',
                              opacity: 0.5,
                            },
                            stroke: {
                                color:'white',
                            },
                        },
                        source: ariegeSource,
                    });

                    return view.addLayer(ariegeLayer);
                }).then(FeatureToolTip.addLayer);
            debug.createTileDebugUI(menuGlobe.gui, view);