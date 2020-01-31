var http = require('http');
var fs = require('fs');

// Chargement du fichier index.html affiché au client
var server = http.createServer(function(req, res) {
    fs.readFile('./index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

// Chargement de socket.io
var io = require('socket.io').listen(server);

// Quand un client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {
    console.log('Un client est connecté !');
});


server.listen(8080);

//https://node-postgres.com/
// BDD fichier: NANTES - 1900
géospécialiser les données
portage + import de CSV
incertitude spatiale, temporelle (toponymie des rues ont parfois changées)
spatiales: on n'a pas le modèle 3D de la maquette, on a un nuage de points. -> Maillage + plan cadastral (avec hauteur des bâtiments) que iTowns gère -> Modèle 3D de Nantes
Unity -> MapBox (éditeur de carte, plugin. cf. tuto option ville numérique)
node_unity -> on doit pouvoir le nuage maillé en lançant unity
Ortophoto de nantes de la maquette sur laquelle on doit afficher des points, où on appuie et des données s'affichent (ex: sucreries)
défi FAISABILITE, pas PERFORMANCE

Cahier des charges????