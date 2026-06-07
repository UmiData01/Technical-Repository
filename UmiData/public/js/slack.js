// ── Configuração base da API ─────────────────────────────────────────────────
const API_BASE = `${window.location.protocol}//${window.location.hostname}:3333`;

// ── Pega o usuário logado da sessão (função para sempre pegar o valor atual) ─
function getFkUsuario() {
    return sessionStorage.getItem("ID_USUARIO") || localStorage.getItem("idUsuario");
}

// ── Carrega as configurações atuais do usuário ao abrir a página ─────────────
async function carregarConfiguracaoSlack() {

    const fkUsuario = getFkUsuario();

    if (!fkUsuario) {
        console.error("Usuário não identificado na sessão.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/slack/${fkUsuario}`);
        const data     = await response.json();

        if (!response.ok) {
            console.error("Erro ao carregar configuração Slack:", data.erro);
            return;
        }

        const toggle = document.getElementById("toggleSlack");
        if (toggle) {
            toggle.checked = data.receberAlerta === 1 || data.receberAlerta === true;
        }

    } catch (erro) {
        console.error("Falha ao buscar configuração Slack:", erro);
    }
}

// ── Salva as preferências quando o usuário alterar o toggle ──────────────────
async function salvarConfiguracaoSlack() {

    const fkUsuario = getFkUsuario();

    if (!fkUsuario) {
        console.error("Usuário não identificado. Faça login novamente.");
        return;
    }

    const toggle           = document.getElementById("toggleSlack");
    const receberAlerta    = toggle ? toggle.checked : false;
    const statusIntegracao = receberAlerta ? "ATIVO" : "INATIVO";

    console.log("Salvando configuração Slack:", { receberAlerta, statusIntegracao });

    try {
        const response = await fetch(`${API_BASE}/slack/${fkUsuario}`, {
            method:  "PUT",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ receberAlerta, statusIntegracao })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Configurações Slack salvas com sucesso!");
        } else {
            console.error("Erro ao salvar:", data.erro);
        }

    } catch (erro) {
        console.error("Falha na requisição:", erro.message);
    }
}

// ── Envia notificação manual para o Slack ────────────────────────────────────
async function enviarNotificacaoSlack(titulo, descricao) {

    const fkUsuario = getFkUsuario();

    if (!fkUsuario) {
        console.error("Usuário não identificado na sessão.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/slack/${fkUsuario}/notificar`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ titulo, descricao })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Notificação Slack enviada:", data.mensagem);
        } else {
            console.error("Erro ao enviar notificação:", data.erro);
        }

    } catch (erro) {
        console.error("Falha ao enviar notificação Slack:", erro);
    }
}

// ── Registra o listener do toggle — chamado pelo dashboard.js ao abrir modal ─
function registrarListenerSlack() {
    const toggle = document.getElementById("toggleSlack");
    if (!toggle) return;

    toggle.removeEventListener("change", salvarConfiguracaoSlack);
    toggle.addEventListener("change",   salvarConfiguracaoSlack);
}