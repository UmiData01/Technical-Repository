var estadosModel = require("../models/estadosModel");

function buscarEstados(req, res) {
    var regiao  = req.params.regiao;
    var empresa = req.query.empresa; // recebe como query param

    if (!empresa) {
        return res.status(400).send("Parâmetro empresa é obrigatório.");
    }

    estadosModel.buscarEstadosPorRegiao(regiao, empresa)
        .then(function(resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum estado encontrado!");
            }
        })
        .catch(function(erro) {
            console.log("Erro ao buscar estados:", erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function cadastrarEstado(req, res) {
    var nome    = req.body.nomeServer;
    var sigla   = req.body.siglaServer;
    var ibge    = req.body.ibgeServer;
    var regiao  = req.body.regiaoServer;
    var empresa = req.body.empresaServer;

    if (!nome)    return res.status(400).send("Nome está undefined!");
    if (!sigla)   return res.status(400).send("Sigla está undefined!");
    if (!ibge)    return res.status(400).send("IBGE está undefined!");
    if (!empresa) return res.status(400).send("Empresa está undefined!");

    estadosModel.cadastrarEstado(ibge, nome, sigla, regiao, empresa)
        .then(function(resultado) {
            res.status(201).json(resultado);
        })
        .catch(function(erro) {
            console.log("Erro ao cadastrar estado:", erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function deletarEstado(req, res) {
    var sigla = req.params.sigla;

    estadosModel.deletarEstado(sigla)
        .then(function(resultado) {
            if (resultado.affectedRows > 0) {
                res.status(200).json({ mensagem: `Estado ${sigla} deletado com sucesso.` });
            } else {
                res.status(404).send("Estado não encontrado.");
            }
        })
        .catch(function(erro) {
            console.log("Erro ao deletar estado:", erro);
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    buscarEstados,
    cadastrarEstado,
    deletarEstado
};