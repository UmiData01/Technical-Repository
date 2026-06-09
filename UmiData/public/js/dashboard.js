// ===== CONFIG =====
const GESTOR            = sessionStorage.getItem("NOME_USUARIO");
const REGIAO            = sessionStorage.getItem("REGIAO_USUARIO");
const TIPO_CARGO_LOGADO = sessionStorage.getItem("TIPO_CARGO");
const EMPRESA_LOGADA    = sessionStorage.getItem("EMPRESA_USUARIO");

let DB = {}, estadoAtual;
let lineChart, barChart;
let dadosLinha = [], dadosSemanais = [];

const CHART_TEXT = "#1e3a5f";
const CHART_GRID = "rgba(147,197,253,0.4)";

// ===== AUXILIARES =====
const listaEstados = () => Object.values(DB);

const ESTADO_BASE = { Sudeste: "SP", Sul: "PR", "Centro-Oeste": "DF", Nordeste: "BA", Norte: "AM" };
const POP_REGIAO  = { Sudeste: 88e6, Nordeste: 57e6, Sul: 31e6, Norte: 18e6, "Centro-Oeste": 17e6 };

function cor(u) {
    if (u < 12)  return "#7f1d1d";
    if (u < 20)  return "#ef4444";
    if (u < 30)  return "#f97316";
    if (u <= 60) return "#eab308";
    return "#22c55e";
}

function status(u) {
    if (u < 12)  return "CRÍTICO";
    if (u < 20)  return "EMERGÊNCIA";
    if (u < 30)  return "ALERTA";
    if (u <= 60) return "ATENÇÃO";
    return "IDEAL";
}

function classeStatus(u) {
    if (u < 12)  return "pill-c";
    if (u < 20)  return "pill-e";
    if (u < 30)  return "pill-a";
    if (u <= 60) return "pill-t";
    return "pill-n";
}

// ===== DRAWER =====
function abrirDrawer()  { document.getElementById("drawer").classList.add("open");    document.getElementById("drawerOv").classList.add("open"); }
function fecharDrawer() { document.getElementById("drawer").classList.remove("open"); document.getElementById("drawerOv").classList.remove("open"); }

// ===== MODAL OPÇÕES =====
let tabAtiva = "acessos";

function abrirOpcoes() {
    document.getElementById("opcoesOv").classList.add("open");
    fecharDrawer();
    configurarModalOpcoes();
    setTab(tabAtiva);
    carregarConfiguracaoSlack();
    registrarListenerSlack();
}

function fecharOpcoes() { document.getElementById("opcoesOv").classList.remove("open"); }

function setTab(tab) {
    tabAtiva = tab;
    document.querySelectorAll(".mopc-nav-btn").forEach(btn =>
        btn.classList.toggle("active", btn.dataset.tab === tab)
    );
    document.querySelectorAll(".mopc-tab").forEach(el =>
        el.style.display = el.id === `tab-${tab}` ? "block" : "none"
    );
}

function configurarModalOpcoes() {
    const btnAcessos      = document.querySelector('[data-tab="acessos"]');
    const tabAcessos      = document.getElementById("tab-acessos");
    const btnNotificacoes = document.querySelector('[data-tab="notificacoes"]');
    const tabNotificacoes = document.getElementById("tab-notificacoes");

    const isAdmin = TIPO_CARGO_LOGADO === "Administrador";

    btnAcessos.style.display = isAdmin ? "" : "none";
    tabAcessos.style.display = isAdmin ? "" : "none";
    btnAcessos.classList.toggle("active", isAdmin);

    if (!isAdmin) {
        tabNotificacoes.style.display = "block";
        btnNotificacoes.classList.add("active");
        tabAtiva = "notificacoes";
    } else {
        carregarUsuariosEmpresa();
    }
}

// ===== USUÁRIOS E PERMISSÕES =====
async function carregarUsuariosEmpresa() {
    try {
        const resposta = await fetch(`/usuarios/listarPorEmpresa/${EMPRESA_LOGADA}`);
        if (!resposta.ok) return;

        const usuarios = await resposta.json();
        const tbody    = document.getElementById("tbodyUsuarios");
        const nomeLogado = sessionStorage.getItem("NOME_USUARIO");

        tbody.innerHTML = usuarios.map(user => {
            const ehProprio = user.nome === nomeLogado;
            const btnExcluir = ehProprio
                ? `<button class="btn btn-c" disabled style="opacity:.5;cursor:not-allowed"><i class="fa-solid fa-ban"></i></button>`
                : `<button class="btn btn-c" style="color:#ef4444" onclick="removerUsuario(${user.idUsuario},'${user.nome}')"><i class="fa-solid fa-trash"></i></button>`;

            return `
                <tr>
                  <td>
                    <div class="user-cell">
                      <div class="user-avatar">${user.nome.charAt(0)}</div>
                      <div>
                        <div class="user-name">${user.nome} ${user.sobrenome}</div>
                        <div class="user-email">${user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select class="perm-select" onchange="alterarPermissao(${user.idUsuario},this.value)">
                      <option value="1" ${user.tipoCargo === "Administrador" ? "selected" : ""}>Administrador</option>
                      <option value="2" ${user.tipoCargo === "Funcionario"   ? "selected" : ""}>Funcionario</option>
                    </select>
                  </td>
                  <td>${btnExcluir}</td>
                </tr>`;
        }).join("");
    } catch (erro) {
        console.error("Erro ao buscar usuários da empresa:", erro);
    }
}

async function alterarPermissao(idUsuario, idNovoCargo) {
    try {
        const resposta = await fetch(`/usuarios/alterarCargo/${idUsuario}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cargoServer: idNovoCargo })
        });
        alert(resposta.ok ? "Permissão atualizada com sucesso!" : "Erro ao atualizar permissão.");
    } catch (erro) {
        console.error("Erro:", erro);
    }
}

async function removerUsuario(idUsuario, nomeUsuario) {
    if (!confirm(`Tem certeza que deseja REVOGAR O ACESSO de ${nomeUsuario}? Esta ação não pode ser desfeita.`)) return;
    try {
        const resposta = await fetch(`/usuarios/deletar/${idUsuario}`, { method: "DELETE" });
        if (resposta.ok) { alert("Usuário removido com sucesso!"); carregarUsuariosEmpresa(); }
        else alert("Erro ao remover usuário.");
    } catch (erro) {
        console.error("Erro:", erro);
    }
}

// ===== SENHA =====
function togglePw(inputId, btn) {
    const input  = document.getElementById(inputId);
    const isText = input.type === "text";
    input.type   = isText ? "password" : "text";
    btn.querySelector("i").className = isText ? "fa-regular fa-eye" : "fa-regular fa-eye-slash";
}

async function salvarSenha() {
    const atual     = document.getElementById("senhaAtual").value;
    const nova      = document.getElementById("novaSenha").value;
    const confirmar = document.getElementById("confirmarSenha").value;
    const idUsuario = sessionStorage.getItem("ID_USUARIO");

    if (!idUsuario)          return alert("Usuário não identificado. Faça login novamente.");
    if (!atual || !nova || !confirmar) return alert("Preencha todos os campos.");
    if (nova.length < 6)     return alert("A nova senha deve ter no mínimo 6 caracteres.");
    if (nova !== confirmar)  return alert("As senhas não coincidem.");

    try {
        const resposta = await fetch(`/usuarios/alterarSenha/${idUsuario}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ senhaAtualServer: atual, novaSenhaServer: nova })
        });

        if (resposta.ok) {
            alert("Senha alterada com sucesso!");
            ["senhaAtual", "novaSenha", "confirmarSenha"].forEach(id => document.getElementById(id).value = "");
            fecharOpcoes();
        } else {
            alert(await resposta.text());
        }
    } catch (erro) {
        console.error("Erro ao alterar senha:", erro);
        alert("Erro de conexão ao tentar alterar a senha.");
    }
}

// ===== CARREGAMENTO DE DADOS =====
async function carregarEstados() {
    try {
        const resposta = await fetch(`/estados/${REGIAO}?empresa=${EMPRESA_LOGADA}`);
        if (!resposta.ok || resposta.status === 204) { DB = {}; return; }

        const dados    = await resposta.json();
        const siglaBase = ESTADO_BASE[REGIAO];
        DB = {};

        dados.forEach(est => {
            if ((est.sigla === siglaBase || est.fkEmpresa !== null) && !DB[est.sigla]) {
                DB[est.sigla] = {
                    id: est.idEstado, nome: est.nome,
                    sigla: est.sigla, umidade: Number(est.umidade), internacoes: 0
                };
            }
        });

        if (!estadoAtual || !DB[estadoAtual]) estadoAtual = Object.keys(DB)[0];
    } catch (erro) {
        console.error("Erro ao carregar estados:", erro);
    }
}

async function buscarGraficos() {
    try {
        const resposta = await fetch(`/graficos/${estadoAtual}`);
        if (!resposta.ok) throw new Error("Erro ao buscar gráficos");
        const dados  = await resposta.json();
        dadosLinha   = dados.linha;
        dadosSemanais = dados.barras;
    } catch (erro) {
        console.error("Erro gráficos:", erro);
    }
}

// ===== RENDERIZADORES =====
async function renderKPIs() {
    try {
        const resposta   = await fetch(`/kpi/${REGIAO}`);
        const dados      = resposta.ok ? await resposta.json() : {};
        const estados    = listaEstados();
        if (!estados.length) return;

        const umidades   = estados.map(e => e.umidade);
        const maxUmi     = Math.max(...umidades);
        const minUmi     = Math.min(...umidades);
        const criticos   = estados.filter(e => e.umidade < 12).length;
        const internacoes = Number(dados.totalInternacoes) || 0;
        const media      = (umidades.reduce((a, b) => a + b, 0) / estados.length).toFixed(1);
        const diff       = media - 60;

        const cards = [
            { label: "Umidade Máxima",   value: maxUmi,      unit: "%", color: cor(maxUmi),
              info: `Média: ${Math.abs(diff).toFixed(1)}% ${diff >= 0 ? "acima" : "abaixo"} do ideal` },
            { label: "Estados Críticos", value: criticos,    unit: "",  color: "#ef4444",
              info: criticos === 0 ? "Controlado: nenhum estado em nível crítico." : `Atenção: ${criticos} estado${criticos !== 1 ? "s" : ""} em nível crítico.` },
            { label: "Internações",      value: internacoes, unit: "",  color: "#2563eb",
              info: `${((internacoes / (POP_REGIAO[REGIAO] || 1)) * 100).toFixed(3)}% da população internada.` },
            { label: "Umidade Mínima",   value: minUmi,      unit: "%", color: cor(minUmi),
              info: minUmi < 30 ? "Necessário reforço em alertas." : "Cenário estável." }
        ];

        document.getElementById("kpiGrid").innerHTML = cards.map(c => `
            <div class="kpi-card" style="--kc:${c.color}">
                <div class="kpi-label">${c.label}</div>
                <div class="kpi-val" style="color:${c.color}">${c.value}${c.unit ? `<span class="kpi-unit"> ${c.unit}</span>` : ""}</div>
                <div class="kpi-info">${c.info}</div>
            </div>`).join("");
    } catch (erro) {
        console.error("Erro KPIs:", erro);
    }
}

function renderMapa() {
    const container  = document.getElementById("mapaCards");
    const card       = container.closest(".v-card");
    const qtdEstados = listaEstados().length;

    container.innerHTML = listaEstados().map(e => `
        <div class="heat-card${e.sigla === estadoAtual ? " ativo" : ""}" style="border-color:${cor(e.umidade)}" onclick="selecionarEstado('${e.sigla}')">
            <span class="hc-sigla">${e.sigla}</span>
            <span class="hc-nome">${e.nome}</span>
            <div class="hc-umi-val">${e.umidade}<span class="hc-umi-unit">%</span></div>
            <div class="hc-bar-track"><div class="hc-bar-fill" style="width:${e.umidade}%;background:${cor(e.umidade)}"></div></div>
            <span class="hc-pill">${status(e.umidade)}</span>
        </div>`).join("");

    card.style.maxHeight  = qtdEstados > 6 ? "320px" : "none";
    card.style.overflowY  = qtdEstados > 6 ? "auto"  : "visible";
}

function renderStatus() {
    document.getElementById("estadoStatusBar").innerHTML =
        `<div class="estado-status-bar"><div class="esb-estado">${DB[estadoAtual].nome}</div></div>`;
}

function renderLinha() {
    const ctx = document.getElementById("lineChart");
    if (lineChart) lineChart.destroy();
    const c = cor(DB[estadoAtual].umidade);

    lineChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: dadosLinha.map(d => `${d.hora}h`),
            datasets: [{
                label: DB[estadoAtual].nome,
                data: dadosLinha.map(d => Number(d.mediaUmidade)),
                borderColor: c, backgroundColor: c + "18",
                pointBackgroundColor: c, pointRadius: 4, borderWidth: 3, tension: 0.3, fill: true
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: CHART_TEXT } } },
            scales: {
                x: { ticks: { color: CHART_TEXT }, grid: { color: CHART_GRID } },
                y: { ticks: { color: CHART_TEXT }, grid: { color: CHART_GRID } }
            }
        }
    });
}

function renderBarras() {
    const ctx    = document.getElementById("barChart");
    if (barChart) barChart.destroy();

    const dados  = dadosSemanais.slice(-4);
    const valores = dados.map(d => Number(d.mediaUmidade));

    barChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: dados.map((_, i) => `Semana ${i + 1}`),
            datasets: [{
                label: DB[estadoAtual].nome,
                data: valores,
                backgroundColor: valores.map(v => cor(v) + "cc"),
                borderColor: valores.map(v => cor(v)),
                borderWidth: 2, borderRadius: 6
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: CHART_TEXT, font: { weight: "700" } } } },
            scales: {
                x: { ticks: { color: CHART_TEXT }, grid: { color: CHART_GRID } },
                y: { ticks: { color: CHART_TEXT }, grid: { color: CHART_GRID } }
            }
        }
    });
}

function renderTabela() {
    document.getElementById("rankBody").innerHTML = listaEstados()
        .sort((a, b) => a.umidade - b.umidade)
        .map((e, i) => `
            <tr>
                <td>${i + 1}</td>
                <td class="td-nm">${e.nome}</td>
                <td>${e.umidade}%</td>
                <td><span class="pill ${classeStatus(e.umidade)}">${status(e.umidade)}</span></td>
            </tr>`).join("");
}

function renderGauge() {
    if (!DB[estadoAtual]) return;
    const u    = DB[estadoAtual].umidade;
    const pct  = Math.min(Math.max(u, 0), 100);
    const cores = {
        "CRÍTICO":    { bg: "#7f1d1d", color: "white"   },
        "EMERGÊNCIA": { bg: "#fee2e2", color: "#dc2626"  },
        "ALERTA":     { bg: "#ffedd5", color: "#ea580c"  },
        "ATENÇÃO":    { bg: "#fef9c3", color: "#ca8a04"  },
        "IDEAL":      { bg: "#dcfce7", color: "#16a34a"  }
    };

    document.getElementById("gaugeNome").textContent  = DB[estadoAtual].nome;
    document.getElementById("gaugeMarker").style.left = pct + "%";

    const badge = document.getElementById("gaugeBadge");
    const c     = cores[status(u)] || { bg: "#e2e8f0", color: "#64748b" };
    badge.textContent       = status(u);
    badge.style.background  = c.bg;
    badge.style.color       = c.color;
}

function selecionarEstado(sigla) { estadoAtual = sigla; renderTudo(); }

async function renderTudo() {
    await carregarEstados();
    if (!Object.keys(DB).length) {
        document.getElementById("estadoStatusBar").innerHTML =
            `<div class="estado-status-bar"><div class="esb-estado">Nenhum estado cadastrado</div></div>`;
        return;
    }
    await buscarGraficos();
    renderKPIs(); renderStatus(); renderMapa();
    renderLinha(); renderBarras(); renderTabela(); renderGauge();
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("nomeGestor").textContent         = GESTOR;
    document.getElementById("regiaoGestor").textContent       = REGIAO;
    document.getElementById("nomeGestorDrawer").textContent   = GESTOR;
    document.getElementById("regiaoGestorDrawer").textContent = REGIAO;

    renderTudo();

    // Drawer
    document.getElementById("btnDrawer").addEventListener("click", abrirDrawer);
    document.getElementById("btnFecharDrawer").addEventListener("click", fecharDrawer);
    document.getElementById("drawerOv").addEventListener("click", e => {
        if (e.target === document.getElementById("drawerOv")) fecharDrawer();
    });

    // Modal opções
    document.getElementById("btnOpcoes").addEventListener("click", abrirOpcoes);
    document.getElementById("btnFecharOpcoes").addEventListener("click", fecharOpcoes);
    document.getElementById("opcoesOv").addEventListener("click", e => {
        if (e.target === document.getElementById("opcoesOv")) fecharOpcoes();
    });

    // Tabs
    document.querySelectorAll(".mopc-nav-btn").forEach(btn =>
        btn.addEventListener("click", () => setTab(btn.dataset.tab))
    );

    // Sair
    document.getElementById("btnSairMenu").addEventListener("click", () => {
        sessionStorage.clear();
        window.location = "../index.html";
    });

    // Modal Angular (aguarda render do custom element)
    setTimeout(() => {
        const modalEl = document.querySelector("app-adicionar-estado-modal");
        const btnAdmin = document.getElementById("btnAdmin");
        if (!modalEl) return;

        if (TIPO_CARGO_LOGADO !== "Administrador") {
            btnAdmin.style.display = "none";
        } else {
            btnAdmin.addEventListener("click", () => { modalEl.aberto = true; fecharDrawer(); });
        }

        modalEl.addEventListener("fechar", () => { modalEl.aberto = false; });

        modalEl.addEventListener("salvar", async (e) => {
            const { nome, sigla, ibge } = e.detail;
            if (DB[sigla]) { alert("Estado já cadastrado no seu painel."); return; }

            try {
                const resposta = await fetch("/estados/cadastrar", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        nomeServer: nome, siglaServer: sigla, ibgeServer: ibge,
                        regiaoServer: REGIAO, empresaServer: EMPRESA_LOGADA
                    })
                });

                if (resposta.ok) {
                    alert(`${nome} adicionado com sucesso!`);
                    modalEl.aberto = false;
                    renderTudo();
                } else {
                    const erro = await resposta.json().catch(() => null) || await resposta.text().catch(() => null);
                    alert(`Erro ao cadastrar estado:\n\n${erro?.erro || erro || "Erro desconhecido."}`);
                }
            } catch (erro) {
                console.error("Erro na requisição:", erro);
                alert("Erro de conexão ao tentar cadastrar o estado.");
            }
        });

        modalEl.addEventListener("excluir", async (e) => {
            const sigla = e.detail;
            if (!confirm(`ATENÇÃO: Tem certeza que deseja excluir o estado ${sigla} e todos os seus dados? Esta ação não pode ser desfeita.`)) return;

            try {
                const resposta = await fetch(`/estados/deletar/${sigla}`, { method: "DELETE" });
                if (resposta.ok) {
                    alert(`Estado ${sigla} excluído com sucesso!`);
                    modalEl.aberto = false;
                    renderTudo();
                } else {
                    alert(`Erro ao excluir estado: ${await resposta.text()}`);
                }
            } catch (erro) {
                console.error("Erro na requisição:", erro);
                alert("Erro de conexão ao tentar excluir o estado.");
            }
        });
    }, 1000);
});