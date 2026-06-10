var database = require("../database/config");
var https    = require("https");
var kpiModel = require("./kpiModel");

// ── Pega a URL do webhook do .env (fallback caso o usuário não tenha configurado) ─
var WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

function buscarConfiguracao(fkUsuario) {
    console.log("Buscando configuração Slack do usuário:", fkUsuario);

    var instrucaoSql = `
        SELECT 
            idSlack,
            nomeCanal,
            tokenSlack,
            receberAlerta,
            statusIntegracao,
            fkUsuario
        FROM slack_integracao
        WHERE fkUsuario = ${fkUsuario}
        LIMIT 1
    `;

    return database.executar(instrucaoSql);
}

function atualizarConfiguracao(fkUsuario, receberAlerta, statusIntegracao, tokenSlack) {
    var instrucaoSql = `
        UPDATE slack_integracao
        SET 
            receberAlerta    = ${receberAlerta ? 1 : 0},
            statusIntegracao = '${statusIntegracao}',
            tokenSlack       = '${tokenSlack || ""}'
        WHERE fkUsuario = ${fkUsuario}
    `;
    return database.executar(instrucaoSql);
}

function enviarNotificacao(fkUsuario, titulo, descricao) {
    console.log("Enviando notificação Slack para o usuário:", fkUsuario);

    var instrucaoSql = `
        SELECT receberAlerta, statusIntegracao, tokenSlack
        FROM slack_integracao
        WHERE fkUsuario = ${fkUsuario}
        LIMIT 1
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

        // ✅ Usa o webhook do banco, com fallback para o .env
        var webhookUrl = (integracao.tokenSlack && integracao.tokenSlack.trim() !== "")
            ? integracao.tokenSlack
            : WEBHOOK_URL;

        if (!webhookUrl || webhookUrl.trim() === "") {
            return { enviado: false, motivo: "Webhook não configurado." };
        }

        var texto = `*${titulo}*\n${descricao}`;
        return enviarWebhook(texto, webhookUrl);
    });
}

async function dispararNotificacoes() {

    var usuarios = await database.executar(`
        SELECT si.idSlack, si.fkUsuario, si.tokenSlack,
        r.nomeRegiao, eg.nomeEmpresa
        FROM slack_integracao si
        INNER JOIN usuario u              ON si.fkUsuario = u.idUsuario
        INNER JOIN empresas_governamentais eg ON u.fkEmpresa = eg.idEmpresa
        INNER JOIN regiao r               ON eg.fkRegiao  = r.idRegiao
        WHERE si.receberAlerta    = 1
        AND   si.statusIntegracao = 'ATIVO'
        AND   si.tokenSlack IS NOT NULL
        AND   si.tokenSlack != ''
    `);

    if (!usuarios.length) {
        console.log("Nenhum usuário com Slack ativo.");
        return { enviadas: 0, falhas: 0 };
    }

    let enviadas = 0, falhas = 0;
    const regioesBuscadas = {};

    for (const u of usuarios) {

        if (!regioesBuscadas[u.nomeRegiao]) {
            const kpis = await kpiModel.buscarKPIs(u.nomeRegiao);
            regioesBuscadas[u.nomeRegiao] = kpis[0];
        }

        const kpi       = regioesBuscadas[u.nomeRegiao];
        const mensagem  = montarMensagem(u.nomeRegiao, kpi);
        const resultado = await enviarWebhook(mensagem, u.tokenSlack);
        const status    = resultado.enviado ? "ENVIADO" : "FALHA";

        await database.executar(`
            INSERT INTO slack_notificacao (mensagem, status, fkSlack)
            VALUES ('${mensagem.replace(/'/g, "''")}', '${status}', ${u.idSlack})
        `);

        resultado.enviado ? enviadas++ : falhas++;
        console.log(`Notificação ${status} para região: ${u.nomeRegiao}`);
    }

    return { enviadas, falhas };
}

function montarMensagem(regiao, kpi) {
    const statusTexto = (u) => {
        if (u < 12)  return "CRÍTICO";
        if (u < 20)  return "EMERGÊNCIA";
        if (u < 30)  return "ALERTA";
        if (u <= 60) return "ATENÇÃO";
        return "IDEAL";
    };

    const agora = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

    return [
        `* UmiData — Resumo Diário | Região ${regiao}*`,
        ``,
        ` *Umidade Máxima:* ${kpi.umidadeMaxima}% — ${statusTexto(kpi.umidadeMaxima)}`,
        ` *Umidade Mínima:* ${kpi.umidadeMinima}% — ${statusTexto(kpi.umidadeMinima)}`,
        ` *Estados Críticos:* ${kpi.estadosCriticos}`,
        ` *Internações:* ${Number(kpi.totalInternacoes).toLocaleString("pt-BR")}`,
        ``,
        `_Verificação: ${agora}_`
    ].join("\n");
}

function enviarWebhook(mensagem, webhookUrl) {
    if (!webhookUrl || webhookUrl.trim() === "") {
        return Promise.resolve({ enviado: false, motivo: "Webhook não configurado." });
    }

    var payload = JSON.stringify({ text: mensagem });
    var url = new URL(webhookUrl.trim());

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
            res.on("data",  function (chunk) { body += chunk; });
            res.on("end",   function () {
                if (body === "ok") {
                    console.log("Notificação Slack enviada com sucesso.");
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
}

module.exports = {
    buscarConfiguracao,
    atualizarConfiguracao,
    enviarNotificacao,
    dispararNotificacoes
};