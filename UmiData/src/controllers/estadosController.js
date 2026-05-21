var estadosModel = require("../models/estadosModel");

function buscarEstados(req, res) {
    var regiao = req.params.regiao;

    estadosModel.buscarEstadosPorRegiao(regiao)
        .then(function(resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum estado encontrado!");
            }
        })
        .catch(function(erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar os estados.", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function cadastrarEstado(req, res) {
    var nome = req.body.nomeServer;
    var sigla = req.body.siglaServer;
    var ibge = req.body.ibgeServer;
    var regiao = req.body.regiaoServer;

    if (nome == undefined) {
        res.status(400).send("Nome está undefined!");
    } else if (sigla == undefined) {
        res.status(400).send("Sigla está undefined!");
    } else if (ibge == undefined) {
        res.status(400).send("IBGE está undefined!");
    } else {
        estadosModel.cadastrarEstado(ibge, nome, sigla, regiao)
            .then(function(resultado) {
                res.json(resultado);
            })
            .catch(function(erro) {
                console.log(erro);
                console.log("Houve um erro ao realizar o cadastro do estado.", erro.sqlMessage);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

module.exports = {
    buscarEstados,
    cadastrarEstado
};