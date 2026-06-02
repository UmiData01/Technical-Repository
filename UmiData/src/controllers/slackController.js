var slackModel = require("../models/slackModel");
 
function buscarConfiguracao(req, res) {
 
    var fkUsuario = req.params.fkUsuario;
 
    console.log("Buscando configuração Slack do usuário:", fkUsuario);
 
    slackModel.buscarConfiguracao(fkUsuario)
        .then(function (resultado) {
 
            if (resultado.length > 0) {
                res.status(200).json(resultado[0]);
            } else {
                res.status(404).json({ erro: "Integração Slack não encontrada para o usuário." });
            }
 
        }).catch(function (erro) {
 
            console.log("Erro ao buscar configuração Slack:", erro);
            res.status(500).json({ erro: erro.sqlMessage || erro.message });
 
        });
}
 
function atualizarConfiguracao(req, res) {
 
    var fkUsuario       = req.params.fkUsuario;
    var receberAlerta   = req.body.receberAlerta;
    var statusIntegracao = req.body.statusIntegracao;
 
    if (receberAlerta === undefined || !statusIntegracao) {
        return res.status(400).json({ erro: "Campos receberAlerta e statusIntegracao são obrigatórios." });
    }
 
    console.log("Atualizando configuração Slack do usuário:", fkUsuario);
 
    slackModel.atualizarConfiguracao(fkUsuario, receberAlerta, statusIntegracao)
        .then(function (resultado) {
 
            if (resultado.affectedRows > 0) {
                res.status(200).json({ mensagem: "Configuração Slack atualizada com sucesso." });
            } else {
                res.status(404).json({ erro: "Integração Slack não encontrada para o usuário." });
            }
 
        }).catch(function (erro) {
 
            console.log("Erro ao atualizar configuração Slack:", erro);
            res.status(500).json({ erro: erro.sqlMessage || erro.message });
 
        });
}
 
function enviarNotificacao(req, res) {
 
    var fkUsuario = req.params.fkUsuario;
    var titulo    = req.body.titulo;
    var descricao = req.body.descricao;
 
    if (!titulo || !descricao) {
        return res.status(400).json({ erro: "Campos titulo e descricao são obrigatórios." });
    }
 
    console.log("Enviando notificação Slack para o usuário:", fkUsuario);
 
    slackModel.enviarNotificacao(fkUsuario, titulo, descricao)
        .then(function (resultado) {
 
            if (resultado.enviado) {
                res.status(200).json({ mensagem: "Notificação enviada com sucesso." });
            } else {
                res.status(200).json({ mensagem: "Notificação não enviada.", motivo: resultado.motivo });
            }
 
        }).catch(function (erro) {
 
            console.log("Erro ao enviar notificação Slack:", erro);
            res.status(500).json({ erro: erro.message });
 
        });
}
 
module.exports = {
    buscarConfiguracao,
    atualizarConfiguracao,
    enviarNotificacao
};