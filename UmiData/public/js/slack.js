// ── Configuração base da API ─────────────────────────────────────────────────
const API_BASE = `${window.location.protocol}//${window.location.hostname}:3333`;

// ── Pega o usuário logado da sessão ──────────────────────────────────────────
const fkUsuario = localStorage.getItem("idUsuario") || sessionStorage.getItem("idUsuario");

// ── Carrega as configurações atuais do usuário ao abrir a página ─────────────
async function carregarConfiguracaoSlack() {

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

        document.getElementById("slack-ativo").checked     = data.statusIntegracao === "ATIVO";
        document.getElementById("slack-alertas").checked   = data.receberAlerta;
        document.getElementById("slack-canal").textContent = data.nomeCanal ?? "—";

    } catch (erro) {
        console.error("Falha ao buscar configuração Slack:", erro);
    }
}

// ── Salva as preferências quando o usuário alterar os toggles ────────────────
async function salvarConfiguracaoSlack() {

    if (!fkUsuario) {
        mostrarFeedback("Usuário não identificado. Faça login novamente.", "erro");
        return;
    }

    const ativo         = document.getElementById("slack-ativo").checked;
    const receberAlerta = document.getElementById("slack-alertas").checked;

    try {
        const response = await fetch(`${API_BASE}/slack/${fkUsuario}`, {
            method:  "PUT",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({
                receberAlerta:    receberAlerta,
                statusIntegracao: ativo ? "ATIVO" : "INATIVO"
            })
        });

        const data = await response.json();

        if (response.ok) {
            mostrarFeedback("Configurações Slack salvas com sucesso!", "sucesso");
        } else {
            mostrarFeedback("Erro ao salvar: " + data.erro, "erro");
        }

    } catch (erro) {
        mostrarFeedback("Falha na requisição: " + erro.message, "erro");
        console.error(erro);
    }
}

// ── Envia notificação manual para o Slack ────────────────────────────────────
async function enviarNotificacaoSlack(titulo, descricao) {

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

// ── Exibe feedback visual para o usuário ─────────────────────────────────────
function mostrarFeedback(mensagem, tipo) {
    const el = document.getElementById("slack-feedback");
    if (!el) return;

    el.textContent   = mensagem;
    el.className     = tipo;
    el.style.display = "block";

    setTimeout(() => {
        el.style.display = "none";
    }, 3000);
}

// ── Inicialização ─────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {

    carregarConfiguracaoSlack();

    document.getElementById("slack-ativo")
        ?.addEventListener("change", salvarConfiguracaoSlack);

    document.getElementById("slack-alertas")
        ?.addEventListener("change", salvarConfiguracaoSlack);
});