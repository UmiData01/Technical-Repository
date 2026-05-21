var kpiModel = require("../models/kpiModel");

function buscarKPIs(req, res) {

    var regiao = req.params.regiao;

    console.log("Buscando KPIs da região:", regiao);

    kpiModel.buscarKPIs(regiao)
        .then(function(resultado) {

            if (resultado.length > 0) {

                res.status(200).json(resultado[0]);

            } else {

                res.status(204).send("Nenhum resultado encontrado!");

            }

        }).catch(function(erro) {

            console.log(erro);

            console.log(
                "Houve um erro ao buscar KPIs.",
                erro.sqlMessage
            );

            res.status(500).json(erro.sqlMessage);

        });
}

module.exports = {
    buscarKPIs
};