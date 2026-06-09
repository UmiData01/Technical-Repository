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

    console.log("=== CADASTRAR ESTADO ===");
    console.log("nome:", nome);
    console.log("sigla:", sigla);
    console.log("ibge:", ibge);
    console.log("regiao:", regiao);
    console.log("empresa:", empresa);

    if (!nome)    return res.status(400).send("Nome está undefined!");
    if (!sigla)   return res.status(400).send("Sigla está undefined!");
    if (!ibge)    return res.status(400).send("IBGE está undefined!");
    if (!empresa) return res.status(400).send("Empresa está undefined!");

    estadosModel.buscarEstadoPorIbge(ibge)
        .then(function(resultado) {

            if (resultado.length === 0) {
                return res.status(404).json({ 
                    erro: `Estado com código IBGE ${ibge} não encontrado.` 
                });
            }

            var estado = resultado[0];

            if (estado.nomeRegiao !== regiao) {
                return res.status(400).json({ 
                    erro: `O estado ${nome} pertence à região ${estado.nomeRegiao}, não à região ${regiao}. Você só pode adicionar estados da sua região.` 
                });
            }

            // Estado válido — associa a empresa via UPDATE (não INSERT)
            return estadosModel.associarEmpresaAoEstado(ibge, empresa)
                .then(function() {
                    res.status(201).json({ mensagem: `Estado ${sigla} adicionado com sucesso.` });
                });
        })
        .catch(function(erro) {
            console.log("Erro ao cadastrar estado:", erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function deletarEstado(req, res) {
    var sigla = req.params.sigla;

    estadosModel.deletarMedidasDoEstado(sigla)
        .then(function() {
            return estadosModel.deletarEstado(sigla);
        })
        .then(function(resultado) {
            if (resultado.affectedRows > 0) {
                res.status(200).json({ mensagem: `Estado ${sigla} e suas medidas foram deletados com sucesso.` });
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