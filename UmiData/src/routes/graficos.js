var express = require("express");
var router = express.Router();

var graficosController = require("../controllers/graficosController");

router.get("/:estado", function (req, res) {
    graficosController.buscarDadosGraficos(req, res);
});

module.exports = router;