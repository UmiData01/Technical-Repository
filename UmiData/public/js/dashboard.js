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

// ===== MODAL ADICIONAR ESTADO =====
function abrirModal() {
    ["fNome", "fSigla", "fIbge"].forEach(id => document.getElementById(id).value = "");
    document.getElementById("modalOv").classList.add("open");
    fecharDrawer();
}

function fecharModal() {
    document.getElementById("modalOv").classList.remove("open");
}

async function salvarEstado() {
    const nome  = document.getElementById("fNome").value.trim();
    const sigla = document.getElementById("fSigla").value.trim().toUpperCase();
    const ibge  = document.getElementById("fIbge").value.trim();

    if (!nome || !sigla || !ibge) { 
        alert("Preencha todos os campos."); 
        return; 
    }
    if (sigla.length < 2 || sigla.length > 3) { 
        alert("Sigla deve ter 2 ou 3 letras."); 
        return; 
    }
    if (DB[sigla]) { 
        alert("Estado já está cadastrado no seu painel."); 
        return; 
    }

    try {
        const resposta = await fetch("/estados/cadastrar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nomeServer: nome,
                siglaServer: sigla,
                ibgeServer: ibge,
                regiaoServer: REGIAO
            })
        });

        if (resposta.ok) {
            alert(`${nome} adicionado com sucesso!`);
            fecharModal();
            renderTudo(); 
        } else {
            const erro = await resposta.text();
            alert(`Erro ao cadastrar estado: ${erro}`);
        }

    } catch (erro) {
        console.error("Erro na requisição:", erro);
        alert("Erro de conexão ao tentar cadastrar o estado.");
    }
}

// ===== MODAL OPÇÕES (CONTROLE DE ACESSOS REAL) =====
let tabAtiva = "acessos";

function abrirOpcoes() {
    document.getElementById("opcoesOv").classList.add("open");
    fecharDrawer();
    configurarModalOpcoes(); // Verifica se é Admin
    setTab(tabAtiva);
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

    if (TIPO_CARGO_LOGADO !== 'Administrador') {
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
                          <option value="1" ${user.tipoCargo === 'Administrador' ? 'selected' : ''}>Administrador</option>
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
    if(!confirm(`Tem certeza que deseja REVOGAR O ACESSO de ${nomeUsuario}? Esta ação não pode ser desfeita.`)) return;

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

function salvarSenha() {
    const atual = document.getElementById("senhaAtual").value;
    const nova = document.getElementById("novaSenha").value;
    const confirmar = document.getElementById("confirmarSenha").value;

    if (!atual || !nova || !confirmar) { alert("Preencha todos os campos."); return; }
    if (nova.length < 6) { alert("A nova senha deve ter no mínimo 6 caracteres."); return; }
    if (nova !== confirmar) { alert("As senhas não coincidem."); return; }

    alert("Simulação: Senha alterada com sucesso.");
    ["senhaAtual", "novaSenha", "confirmarSenha"].forEach(id => document.getElementById(id).value = "");
}

// ===== REQUISIÇÕES DOS GRÁFICOS =====
async function carregarEstados() {
    try {
        const resposta = await fetch(`/estados/${REGIAO}`);
        if (!resposta.ok) throw new Error("Erro ao buscar estados");
        if (resposta.status === 204) {
            console.warn("Nenhum estado cadastrado para esta região ainda.");
            DB = {}; 
            return;  
        }
        
        const dados = await resposta.json();
        DB = {}; 
        dados.forEach(est => {
            DB[est.sigla] = {
                id: est.idEstado,
                nome: est.nome,
                sigla: est.sigla,
                umidade: Number(est.umidade),
                internacoes: 0 
            };
        });

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

        const maxUmi = Number(dados.umidadeMaxima) || 0;
        const minUmi = Number(dados.umidadeMinima) || 0;
        const criticos = Number(dados.estadosCriticos) || 0;

        const cards = [
            { label: "Umidade Máxima", value: maxUmi, unit: "%", color: cor(maxUmi), info: "Maior umidade na região." },
            { label: "Estados Críticos", value: criticos, unit: "", color: "#ef4444", info: "Abaixo de 12%." },
            { label: "Internações", value: 0, unit: "", color: "#2563eb", info: "Sem integração." },
            { label: "Umidade Mínima", value: minUmi, unit: "%", color: cor(minUmi), info: "Menor umidade na região." }
        ];

        const container = document.getElementById("kpiGrid");
        container.innerHTML = "";
        cards.forEach(card => {
            container.innerHTML += `
              <div class="kpi-card" style="--kc: ${card.color}">
                <div class="kpi-label">${card.label}</div>
                <div class="kpi-val" style="color:${card.color}">${card.value} ${card.unit ? `<span class="kpi-unit">${card.unit}</span>` : ""}</div>
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
    
    // 🔴 AQUI ESTÁ O LIMITADOR: Pega apenas os 4 últimos registros (ou os 4 primeiros)
    // O slice(-4) garante que se vierem 10 semanas do banco, ele só vai pegar as 4 mais recentes
    const dadosLimitados = dadosSemanais.slice(-4);
    
    const valores = dadosLimitados.map(d => Number(d.mediaUmidade));
    
    barChart = new Chart(ctx, {
        type: "bar",
        data: {
            // Usa o array limitado para gerar as labels (Semana 1, Semana 2, etc.)
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
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("nomeGestor").textContent = GESTOR;
    document.getElementById("regiaoGestor").textContent = REGIAO;
    document.getElementById("nomeGestorDrawer").textContent = GESTOR;
    document.getElementById("regiaoGestorDrawer").textContent = REGIAO;

    renderTudo();

    document.getElementById("btnDrawer").addEventListener("click", abrirDrawer);
    document.getElementById("btnFecharDrawer").addEventListener("click", fecharDrawer);
    document.getElementById("drawerOv").addEventListener("click", e => { if (e.target === document.getElementById("drawerOv")) fecharDrawer(); });

    document.getElementById("btnAdmin").addEventListener("click", abrirModal);
    document.getElementById("btnCancelar").addEventListener("click", fecharModal);
    document.getElementById("btnSalvar").addEventListener("click", salvarEstado);
    document.getElementById("modalOv").addEventListener("click", e => { if (e.target === document.getElementById("modalOv")) fecharModal(); });

    document.getElementById("btnOpcoes").addEventListener("click", abrirOpcoes);
    document.getElementById("btnFecharOpcoes").addEventListener("click", fecharOpcoes);
    document.getElementById("opcoesOv").addEventListener("click", e => { if (e.target === document.getElementById("opcoesOv")) fecharOpcoes(); });

    document.querySelectorAll(".mopc-nav-btn").forEach(btn =>
        btn.addEventListener("click", () => setTab(btn.dataset.tab))
    );

    // ===== MODAL SAIR =====
  const modalSair = document.getElementById("modalSairOv");

  // Abre o modal ao clicar em "Sair" no menu
  document.getElementById("btnSairMenu").addEventListener("click", () => {
    modalSair.classList.add("open");
    fecharDrawer(); // Fecha o menu lateral para não ficar bagunçado
  });

  // Fecha o modal se clicar em "Ficar"
  document.getElementById("btnCancelarSair").addEventListener("click", () => {
    modalSair.classList.remove("open");
  });

  // Fecha se clicar fora da caixinha do modal
  modalSair.addEventListener("click", (e) => {
    if (e.target === modalSair) modalSair.classList.remove("open");
  });

  // Ação real de sair (limpa os dados e redireciona)
  document.getElementById("btnConfirmarSair").addEventListener("click", () => {
    sessionStorage.clear(); // Apaga quem estava logado
    window.location = "../index.html"; // Manda de volta pra tela de login
  });
});