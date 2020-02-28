var express = require('express'); // require Express
var router = express.Router(); // setup usage of the Express router engine
const path = require('path');

/* ------------------------- Nantes map -------------------------- */
router.get('/nantes', function(req, res) {
    res.render(path.join(__dirname+'/../views/nantes.html.twig'));
});

module.exports = router;