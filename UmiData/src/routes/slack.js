var express = require("express");
var router = express.Router();
var slackController = require("../controllers/slackController");
 
// GET /slack/:fkUsuario → busca configuração atual do usuário
router.get("/:fkUsuario", function (req, res) {
    slackController.buscarConfiguracao(req, res);
});
 
// PUT /slack/:fkUsuario → atualiza receberAlerta e statusIntegracao
router.put("/:fkUsuario", function (req, res) {
    slackController.atualizarConfiguracao(req, res);
});
 
// POST /slack/:fkUsuario/notificar → envia notificação para o canal do usuário
router.post("/:fkUsuario/notificar", function (req, res) {
    slackController.enviarNotificacao(req, res);
});
 
module.exports = router;