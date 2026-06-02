var database   = require("../database/config");
var https      = require("https");

// ── Pega a URL do webhook do .env ────────────────────────────────────────────
var WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

function buscarConfiguracao(fkUsuario) {
    console.log("Buscando configuração Slack do usuário:", fkUsuario);

    var instrucaoSql = `
        SELECT 
            idSlack,
            nomeCanal,
            receberAlerta,
            statusIntegracao,
            fkUsuario
        FROM slack_integracao
        WHERE fkUsuario = ${fkUsuario}
        LIMIT 1;
    `;

    return database.executar(instrucaoSql);
}

function atualizarConfiguracao(fkUsuario, receberAlerta, statusIntegracao) {
    console.log("Atualizando configuração Slack do usuário:", fkUsuario);

    var instrucaoSql = `
        UPDATE slack_integracao
        SET 
            receberAlerta    = ${receberAlerta ? 1 : 0},
            statusIntegracao = '${statusIntegracao}'
        WHERE fkUsuario = ${fkUsuario};
    `;

    return database.executar(instrucaoSql);
}

function enviarNotificacao(fkUsuario, titulo, descricao) {
    console.log("Enviando notificação Slack para o usuário:", fkUsuario);

    // Verifica se o webhook está configurado
    if (!WEBHOOK_URL || WEBHOOK_URL.trim() === "") {
        console.log("SLACK_WEBHOOK_URL não definida no .env");
        return Promise.resolve({ enviado: false, motivo: "Webhook não configurado." });
    }

    var instrucaoSql = `
        SELECT receberAlerta, statusIntegracao
        FROM slack_integracao
        WHERE fkUsuario = ${fkUsuario}
        LIMIT 1;
    `;

    return database.executar(instrucaoSql).then(function (resultado) {

        if (resultado.length === 0) {
            console.log("Nenhuma integração Slack encontrada para o usuário:", fkUsuario);
            return { enviado: false, motivo: "Integração não encontrada." };
        }

        var integracao = resultado[0];

        if (!integracao.receberAlerta || integracao.statusIntegracao !== "ATIVO") {
            console.log("Notificações desativadas para o usuário:", fkUsuario);
            return { enviado: false, motivo: "Notificações desativadas." };
        }

        var texto   = `*${titulo}*\n${descricao}`;
        var payload = JSON.stringify({ text: texto });
        var url     = new URL(WEBHOOK_URL.trim());

        return new Promise(function (resolve, reject) {

            var options = {
                hostname: url.hostname,
                path:     url.pathname,
                method:   "POST",
                headers:  {
                    "Content-Type":   "application/json",
                    "Content-Length": Buffer.byteLength(payload)
                }
            };

            var req = https.request(options, function (res) {
                var body = "";
                res.on("data", function (chunk) { body += chunk; });
                res.on("end", function () {
                    if (body === "ok") {
                        console.log("Notificação Slack enviada com sucesso para o usuário:", fkUsuario);
                        resolve({ enviado: true });
                    } else {
                        console.log("Slack retornou erro:", body);
                        resolve({ enviado: false, motivo: body });
                    }
                });
            });

            req.on("error", function (erro) {
                console.log("Erro ao enviar notificação Slack:", erro.message);
                reject(erro);
            });

            req.write(payload);
            req.end();
        });
    });
}

module.exports = {
    buscarConfiguracao,
    atualizarConfiguracao,
    enviarNotificacao
};