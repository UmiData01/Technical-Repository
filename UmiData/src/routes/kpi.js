var express = require("express");
var router = express.Router();

var kpiController = require("../controllers/kpiController");

router.get("/:regiao", function (req, res) {
    kpiController.buscarKPIs(req, res);
});

module.exports = router;