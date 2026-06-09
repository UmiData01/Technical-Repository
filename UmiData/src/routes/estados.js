var express = require("express");
var router  = express.Router();
var estadosController = require("../controllers/estadosController");

router.get("/:regiao", function (req, res) {
    estadosController.buscarEstados(req, res);
});

router.post("/cadastrar", function (req, res) {
    estadosController.cadastrarEstado(req, res);
});

router.delete("/deletar/:sigla", function (req, res) {
    estadosController.deletarEstado(req, res);
});

module.exports = router;