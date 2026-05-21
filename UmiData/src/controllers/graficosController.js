var graficosModel = require("../models/graficosModel");

function buscarDadosGraficos(req, res) {

    var regiao = req.params.estado;

    console.log("Buscando dados dos gráficos da região:", regiao);

    graficosModel.buscarGraficos(regiao)

        .then(function(resultado) {

            res.status(200).json(resultado);

        })

        .catch(function(erro) {

            console.log(erro);

            console.log(
                "Houve um erro ao buscar dados dos gráficos.",
                erro.sqlMessage
            );

            res.status(500).json(erro.sqlMessage);

        });

}

module.exports = {
    buscarDadosGraficos
};