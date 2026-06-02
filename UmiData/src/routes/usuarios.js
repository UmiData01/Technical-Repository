var express = require("express");
var router = express.Router();

var usuarioController = require("../controllers/usuarioController");

//Recebendo os dados do html e direcionando para a função cadastrar de usuarioController.js
router.post("/cadastrar", function (req, res) {
    usuarioController.cadastrar(req, res);
})

router.post("/autenticar", function (req, res) {
    usuarioController.autenticar(req, res);
});

router.get("/listarPorEmpresa/:empresa", function (req, res) {
    usuarioController.listarPorEmpresa(req, res);
});

router.put("/alterarCargo/:idUsuario", function (req, res) {
    usuarioController.alterarCargo(req, res);
});

router.delete("/deletar/:idUsuario", function (req, res) {
    usuarioController.deletarUsuario(req, res);
});

router.put("/alterarSenha/:idUsuario", function (req, res) {
    usuarioController.alterarSenha(req, res);
});

module.exports = router;