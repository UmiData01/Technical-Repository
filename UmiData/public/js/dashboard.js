// ===== CONFIG =====
const GESTOR = sessionStorage.getItem("NOME_USUARIO");
const REGIAO = sessionStorage.getItem("REGIAO_USUARIO");
const TIPO_CARGO_LOGADO = sessionStorage.getItem("TIPO_CARGO");
const EMPRESA_LOGADA = sessionStorage.getItem("EMPRESA_USUARIO");

let DB = {};
let estadoAtual;
let lineChart, barChart;
let dadosLinha = [];
let dadosSemanais = [];

const CHART_TEXT = "#1e3a5f";
const CHART_GRID = "rgba(147,197,253,0.4)";

// ===== AUXILIARES =====
const listaEstados = () => Object.values(DB);

function cor(u) {
    if (u < 12) return "#7f1d1d";
    if (u < 20) return "#ef4444";
    if (u < 30) return "#f97316";
    if (u <= 60) return "#eab308";
    return "#22c55e";
}

function renderMapa() {
    const container = document.getElementById("mapaCards");
    container.innerHTML = "";
    listaEstados().forEach(e => {
        container.innerHTML += `...`; 
    });

    // ── Estrutura de decisão: scroll ou não ──────────────────────────────────
    const card       = container.closest(".v-card");
    const qtdEstados = listaEstados().length;

    if (qtdEstados > 6) {
        // Muitos estados — ativa scroll no card inteiro
        card.style.maxHeight  = "320px";
        card.style.overflowY  = "auto";
        container.style.height = "auto";
    } else {
        // Poucos estados — sem scroll, mostra tudo
        card.style.maxHeight  = "none";
        card.style.overflowY  = "visible";
        container.style.height = "auto";
    }
}

function status(u) {
    if (u < 12) return "CRÍTICO";
    if (u < 20) return "EMERGÊNCIA";
    if (u < 30) return "ALERTA";
    if (u <= 60) return "ATENÇÃO";
    return "IDEAL";
}

function classeStatus(u) {
    if (u < 12) return "pill-c";
    if (u < 20) return "pill-e";
    if (u < 30) return "pill-a";
    if (u <= 60) return "pill-t";
    return "pill-n";
}

// ===== DRAWER =====
function abrirDrawer() {
    document.getElementById("drawer").classList.add("open");
    document.getElementById("drawerOv").classList.add("open");
}

function fecharDrawer() {
    document.getElementById("drawer").classList.remove("open");
    document.getElementById("drawerOv").classList.remove("open");
}

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

function fecharOpcoes() {
    document.getElementById("opcoesOv").classList.remove("open");
}

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
    const btnAcessos = document.querySelector('[data-tab="acessos"]');
    const tabAcessos = document.getElementById('tab-acessos');
    const tabNotificacoes = document.getElementById('tab-notificacoes');
    const btnNotificacoes = document.querySelector('[data-tab="notificacoes"]');

    if (TIPO_CARGO_LOGADO !== 'Admin') {
        btnAcessos.style.display = 'none';
        tabAcessos.style.display = 'none';
        btnAcessos.classList.remove('active');
        tabNotificacoes.style.display = 'block';
        btnNotificacoes.classList.add('active');
        tabAtiva = 'notificacoes';
    } else {
        carregarUsuariosEmpresa();
    }
}

// ===== INTEGRAÇÃO COM BACKEND: USUÁRIOS E PERMISSÕES =====
async function carregarUsuariosEmpresa() {
    try {
        const resposta = await fetch(`/usuarios/listarPorEmpresa/${EMPRESA_LOGADA}`);

        if (resposta.ok) {
            const usuarios = await resposta.json();
            const tbody = document.getElementById("tbodyUsuarios");
            tbody.innerHTML = "";

            usuarios.forEach(user => {
                const btnExcluir = user.nome === sessionStorage.getItem("NOME_USUARIO")
                    ? `<button class="btn btn-c" disabled style="opacity: 0.5; cursor: not-allowed;"><i class="fa-solid fa-ban"></i></button>`
                    : `<button class="btn btn-c" style="color: #ef4444;" onclick="removerUsuario(${user.idUsuario}, '${user.nome}')"><i class="fa-solid fa-trash"></i></button>`;

                tbody.innerHTML += `
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
                        <select class="perm-select" onchange="alterarPermissao(${user.idUsuario}, this.value)">
                          <option value="1" ${user.tipoCargo === 'Admin' ? 'selected' : ''}>Admin</option>
                          <option value="2" ${user.tipoCargo === 'Padrao' ? 'selected' : ''}>Padrão</option>
                        </select>
                      </td>
                      <td>
                        ${btnExcluir}
                      </td>
                    </tr>
                `;
            });
        }
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

        if (resposta.ok) {
            alert("Permissão atualizada com sucesso!");
        } else {
            alert("Erro ao atualizar permissão.");
        }
    } catch (erro) {
        console.error("Erro:", erro);
    }
}

async function removerUsuario(idUsuario, nomeUsuario) {
    if (!confirm(`Tem certeza que deseja REVOGAR O ACESSO de ${nomeUsuario}? Esta ação não pode ser desfeita.`)) return;

    try {
        const resposta = await fetch(`/usuarios/deletar/${idUsuario}`, { method: "DELETE" });

        if (resposta.ok) {
            alert("Usuário removido com sucesso!");
            carregarUsuariosEmpresa();
        } else {
            alert("Erro ao remover usuário.");
        }
    } catch (erro) {
        console.error("Erro:", erro);
    }
}

// ===== SENHA =====
function togglePw(inputId, btn) {
    const input = document.getElementById(inputId);
    const isText = input.type === "text";
    input.type = isText ? "password" : "text";
    btn.querySelector("i").className = isText ? "fa-regular fa-eye" : "fa-regular fa-eye-slash";
}

async function salvarSenha() {
    const atual = document.getElementById("senhaAtual").value;
    const nova = document.getElementById("novaSenha").value;
    const confirmar = document.getElementById("confirmarSenha").value;
    const idUsuario = sessionStorage.getItem("ID_USUARIO");

    if (!idUsuario) {
        alert("Usuário não identificado. Faça login novamente.");
        return;
    }

    if (!atual || !nova || !confirmar) {
        alert("Preencha todos os campos.");
        return;
    }

    if (nova.length < 6) {
        alert("A nova senha deve ter no mínimo 6 caracteres.");
        return;
    }

    if (nova !== confirmar) {
        alert("As senhas não coincidem.");
        return;
    }

    try {
        const resposta = await fetch(`/usuarios/alterarSenha/${idUsuario}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                senhaAtualServer: atual,
                novaSenhaServer: nova
            })
        });

        if (resposta.ok) {
            alert("Senha alterada com sucesso!");
            ["senhaAtual", "novaSenha", "confirmarSenha"].forEach(id => {
                document.getElementById(id).value = "";
            });
            fecharOpcoes();
        } else {
            const erro = await resposta.text();
            alert(erro);
        }

    } catch (erro) {
        console.error("Erro ao alterar senha:", erro);
        alert("Erro de conexão ao tentar alterar a senha.");
    }
}

// ===== REQUISIÇÕES DOS GRÁFICOS =====
async function carregarEstados() {
    try {
        const resposta = await fetch(`/estados/${REGIAO}?empresa=${EMPRESA_LOGADA}`);
        if (!resposta.ok) throw new Error("Erro ao buscar estados");
        if (resposta.status === 204) {
            console.warn("Nenhum estado cadastrado para esta região ainda.");
            DB = {};
            return;
        }

        const dados = await resposta.json();
        DB = {};

        // 1. Define os estados base de cada região
        const estadosBasePorRegiao = {
            'Sudeste': 'SP',
            'Sul': 'PR',
            'Centro-Oeste': 'DF',
            'Nordeste': 'BA',
            'Norte': 'AM'
        };
        const siglaBase = estadosBasePorRegiao[REGIAO]; // Ex: 'SP' se for Sudeste

        // 2. Filtra os dados que vieram do banco
        dados.forEach(est => {
            // Regra de exibição: 
            // Mostra se for a Sigla Base da região OU se a fkEmpresa não for nula (ou seja, foi adicionado via Modal)
            if (est.sigla === siglaBase || est.fkEmpresa !== null) {
                
                // O if abaixo evita duplicatas caso o banco traga o SP base e um SP adicionado
                if (!DB[est.sigla]) {
                    DB[est.sigla] = {
                        id: est.idEstado,
                        nome: est.nome,
                        sigla: est.sigla,
                        umidade: Number(est.umidade),
                        internacoes: 0 // Valor mocado, caso venha do banco depois, é só alterar
                    };
                }
            }
        });

        // 3. Define o primeiro estado do objeto como o estado focado na tela
        if (!estadoAtual || !DB[estadoAtual]) {
            estadoAtual = Object.keys(DB)[0];
        }
    } catch (erro) {
        console.error("Erro ao carregar estados:", erro);
    }
}

async function buscarGraficos() {
    try {
        const resposta = await fetch(`/graficos/${estadoAtual}`);
        if (!resposta.ok) throw new Error("Erro ao buscar gráficos");
        const dados = await resposta.json();
        dadosLinha = dados.linha;
        dadosSemanais = dados.barras;
    } catch (erro) {
        console.error("Erro gráficos:", erro);
    }
}

// ===== RENDERIZADORES DO DASHBOARD =====
async function renderKPIs() {
    try {
        const resposta = await fetch(`/kpi/${REGIAO}`);
        if (!resposta.ok) throw new Error("Erro ao buscar KPIs");
        const dados = await resposta.json();

        const maxUmi      = Number(dados.umidadeMaxima)    || 0;
        const minUmi      = Number(dados.umidadeMinima)    || 0;
        const criticos    = Number(dados.estadosCriticos)  || 0;
        const internacoes = Number(dados.totalInternacoes) || 0;
        const totalEstados = Object.keys(DB).length;

        // ── KPI Umidade Máxima ──────────────────────────────────────────
        const estados     = listaEstados();
        const mediaRegiao = estados.length > 0
            ? (estados.reduce((soma, e) => soma + e.umidade, 0) / estados.length).toFixed(1)
            : 0;

        const diff = Number(mediaRegiao) - 60;
        const infoMax = diff >= 0
            ? `A média da região é ${diff.toFixed(1)}% acima do ideal.`
            : `A média da região é ${Math.abs(diff).toFixed(1)}% abaixo do ideal.`;

        // ── KPI Estados Críticos ────────────────────────────────────────
        const metade        = totalEstados / 2;
        const cenario       = criticos > metade ? "Cenário Problemático" : "Cenário Controlado";
        const infoCriticos  = `${cenario}, ${criticos} estado${criticos !== 1 ? "s" : ""} no nível crítico.`;

        // ── KPI Internações ─────────────────────────────────────────────
        const popRegioes = {
            "Sudeste":      88000000,
            "Nordeste":     57000000,
            "Sul":          31000000,
            "Norte":        18000000,
            "Centro-Oeste": 17000000
        };
        const pop          = popRegioes[REGIAO] || 1;
        const pctInternac  = ((internacoes / pop) * 100).toFixed(1);
        const infoInternac = `${pctInternac}% da população precisou de internação.`;

        // ── KPI Umidade Mínima ──────────────────────────────────────────
        const infoMin = minUmi < 30
            ? "Necessário reforço em alertas públicos."
            : "Não é necessário reforço em alertas públicos.";

        const cards = [
            { label: "Umidade Máxima",   value: maxUmi,      unit: "%", color: cor(maxUmi), info: infoMax      },
            { label: "Estados Críticos", value: criticos,    unit: "",  color: "#ef4444",   info: infoCriticos },
            { label: "Internações",      value: internacoes, unit: "",  color: "#2563eb",   info: infoInternac },
            { label: "Umidade Mínima",   value: minUmi,      unit: "%", color: cor(minUmi), info: infoMin      }
        ];

        const container = document.getElementById("kpiGrid");
        container.innerHTML = "";
        cards.forEach(card => {
            container.innerHTML += `
              <div class="kpi-card" style="--kc: ${card.color}">
                <div class="kpi-label">${card.label}</div>
                <div class="kpi-val" style="color:${card.color}">${card.value}${card.unit ? `<span class="kpi-unit"> ${card.unit}</span>` : ""}</div>
                <div class="kpi-info">${card.info}</div>
              </div>`;
        });
    } catch (erro) {
        console.error("Erro KPIs:", erro);
    }
}

function renderMapa() {
    const container = document.getElementById("mapaCards");
    container.innerHTML = "";
    listaEstados().forEach(e => {
        container.innerHTML += `
          <div class="heat-card${e.sigla === estadoAtual ? " ativo" : ""}" style="border-color:${cor(e.umidade)}" onclick="selecionarEstado('${e.sigla}')">
            <span class="hc-sigla">${e.sigla}</span>
            <span class="hc-nome">${e.nome}</span>
            <div class="hc-umi-val">${e.umidade}<span class="hc-umi-unit">%</span></div>
            <div class="hc-bar-track">
              <div class="hc-bar-fill" style="width:${e.umidade}%;background:${cor(e.umidade)}"></div>
            </div>
            <span class="hc-pill">${status(e.umidade)}</span>
          </div>`;
    });
}

function renderStatus() {
    document.getElementById("estadoStatusBar").innerHTML = `<div class="estado-status-bar"><div class="esb-estado">${DB[estadoAtual].nome}</div></div>`;
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
                borderColor: c,
                backgroundColor: c + "18",
                pointBackgroundColor: c,
                pointRadius: 4, borderWidth: 3, tension: 0.3, fill: true
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
    const ctx = document.getElementById("barChart");
    if (barChart) barChart.destroy();

    const dadosLimitados = dadosSemanais.slice(-4);
    const valores = dadosLimitados.map(d => Number(d.mediaUmidade));

    barChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: dadosLimitados.map((d, i) => `Semana ${i + 1}`),
            datasets: [{
                label: DB[estadoAtual].nome,
                data: valores,
                backgroundColor: valores.map(v => cor(v) + "cc"),
                borderColor: valores.map(v => cor(v)),
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: CHART_TEXT, font: { weight: "700" } } }
            },
            scales: {
                x: { ticks: { color: CHART_TEXT }, grid: { color: CHART_GRID } },
                y: { ticks: { color: CHART_TEXT }, grid: { color: CHART_GRID } }
            }
        }
    });
}

function renderTabela() {
    const tbody = document.getElementById("rankBody");
    tbody.innerHTML = "";
    listaEstados().sort((a, b) => a.umidade - b.umidade).forEach((e, i) => {
        tbody.innerHTML += `
          <tr>
            <td>${i + 1}</td>
            <td class="td-nm">${e.nome}</td>
            <td>${e.umidade}%</td>
            <td>${e.internacoes}</td>
            <td><span class="pill ${classeStatus(e.umidade)}">${status(e.umidade)}</span></td>
          </tr>`;
    });
}

function selecionarEstado(sigla) { estadoAtual = sigla; renderTudo(); }

function renderGauge() {
    if (!DB[estadoAtual]) return;

    const u      = DB[estadoAtual].umidade;
    const nome   = DB[estadoAtual].nome;
    const pct    = Math.min(Math.max(u, 0), 100);

    document.getElementById("gaugeNome").textContent  = nome;
    document.getElementById("gaugeMarker").style.left = pct + "%";

    const badge = document.getElementById("gaugeBadge");
    badge.textContent = status(u);

    // Cor do badge conforme status
    const cores = {
        "CRÍTICO":    { bg: "#7f1d1d", color: "white" },
        "EMERGÊNCIA": { bg: "#fee2e2", color: "#dc2626" },
        "ALERTA":     { bg: "#ffedd5", color: "#ea580c" },
        "ATENÇÃO":    { bg: "#fef9c3", color: "#ca8a04" },
        "IDEAL":      { bg: "#dcfce7", color: "#16a34a" }
    };

    const c = cores[status(u)] || { bg: "#e2e8f0", color: "#64748b" };
    badge.style.background = c.bg;
    badge.style.color      = c.color;
}

// Atualize selecionarEstado para chamar renderGauge
function selecionarEstado(sigla) {
    estadoAtual = sigla;
    renderTudo();
}

async function renderTudo() {
    await carregarEstados();
    if (Object.keys(DB).length === 0) {
        document.getElementById("estadoStatusBar").innerHTML = `<div class="estado-status-bar"><div class="esb-estado">Nenhum estado cadastrado</div></div>`;
        return;
    }
    await buscarGraficos();
    renderKPIs();
    renderStatus();
    renderMapa();
    renderLinha();
    renderBarras();
    renderTabela();
    renderGauge();
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

    // Modal sair
    const modalSair = document.getElementById("modalSairOv");

    document.getElementById("btnSairMenu").addEventListener("click", () => {
     sessionStorage.clear();
        window.location = "../index.html";
    });


    // ===== MODAL ADICIONAR ESTADO (Angular Element) =====
    // ===== MODAL ADICIONAR ESTADO (Angular Element) =====
setTimeout(() => {
  const modalEl = document.querySelector('app-adicionar-estado-modal');
  if (!modalEl) return;

  const btnAdmin = document.getElementById("btnAdmin");

    if (TIPO_CARGO_LOGADO !== "Admin") {
        btnAdmin.style.display = "none";
    }  

  if (TIPO_CARGO_LOGADO === "Admin") {
  document.getElementById('btnAdmin').addEventListener('click', () => {
    modalEl.aberto = true;
    fecharDrawer();
  });
}

  modalEl.addEventListener('fechar', () => {
    modalEl.aberto = false;
  });

  modalEl.addEventListener('salvar', async (e) => {
    const { nome, sigla, ibge } = e.detail;

    if (DB[sigla]) { alert('Estado já cadastrado no seu painel.'); return; }

    try {
      const resposta = await fetch('/estados/cadastrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeServer: nome,
          siglaServer: sigla,
          ibgeServer: ibge,
          regiaoServer: REGIAO,
          empresaServer: EMPRESA_LOGADA
        })
      });

      if (resposta.ok) {
        alert(`${nome} adicionado com sucesso!`);
        modalEl.aberto = false;
        renderTudo();
      } else {
        const erro = await resposta.text();
        alert(`Erro ao cadastrar estado: ${erro}`);
      }
    } catch (erro) {
      console.error('Erro na requisição:', erro);
      alert('Erro de conexão ao tentar cadastrar o estado.');
    }
  });

  modalEl.addEventListener('excluir', async (e) => {
    const sigla = e.detail; // Pega a sigla que foi emitida pelo Angular

    if (!confirm(`ATENÇÃO: Tem certeza que deseja excluir o estado ${sigla} e todos os seus dados? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      
      const resposta = await fetch(`/estados/deletar/${sigla}`, {
        method: 'DELETE'
      });

      if (resposta.ok) {
        alert(`Estado ${sigla} excluído com sucesso!`);
        modalEl.aberto = false;
        renderTudo(); 
      } else {
        const erro = await resposta.text();
        alert(`Erro ao excluir estado: ${erro}`);
      }
    } catch (erro) {
      console.error('Erro na requisição:', erro);
      alert('Erro de conexão ao tentar excluir o estado.');
    }
  });
}, 1000);
});