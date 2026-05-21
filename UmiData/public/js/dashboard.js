// ===== CONFIG =====
const GESTOR = "Cauã";
const REGIAO = "Sudeste";

// ===== DADOS MOCKADOS =====
const DB = {
  ES: { nome: "Espírito Santo", sigla: "ES", ibge: "32", regiao: "Sudeste", umidade: 42, internacoes: 1100, hospitais: 340 },
  MG: { nome: "Minas Gerais",   sigla: "MG", ibge: "31", regiao: "Sudeste", umidade: 22, internacoes: 3700, hospitais: 980 },
  RJ: { nome: "Rio de Janeiro", sigla: "RJ", ibge: "33", regiao: "Sudeste", umidade: 28, internacoes: 3100, hospitais: 820 },
  SP: { nome: "São Paulo",      sigla: "SP", ibge: "35", regiao: "Sudeste", umidade: 18, internacoes: 4820, hospitais: 1250 },
};

const SERIE = {
  labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
  ES: [48, 46, 45, 44, 43, 42],
  MG: [30, 28, 26, 24, 23, 22],
  RJ: [38, 36, 34, 32, 30, 28],
  SP: [30, 26, 23, 21, 19, 18],
};

const SERIE_SEMANAS = {
  labels: ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
  ES: [50, 47, 44, 42],
  MG: [28, 26, 24, 22],
  RJ: [35, 32, 30, 28],
  SP: [25, 22, 20, 18],
};

let USUARIOS = [
  { id: 1, nome: "Ana Silva",       email: "ana@umidata.com",     permissao: "admin"  },
  { id: 2, nome: "Carlos Oliveira", email: "carlos@umidata.com",  permissao: "padrao" },
  { id: 3, nome: "Mariana Santos",  email: "mariana@umidata.com", permissao: "padrao" },
  { id: 4, nome: "Roberto Almeida", email: "roberto@umidata.com", permissao: "admin"  },
];

const ESTADOS_INFO = {
  ES:{ nome:"Espírito Santo",      regiao:"Sudeste" },
  MG:{ nome:"Minas Gerais",        regiao:"Sudeste" },
  RJ:{ nome:"Rio de Janeiro",      regiao:"Sudeste" },
  SP:{ nome:"São Paulo",           regiao:"Sudeste" },
  PR:{ nome:"Paraná",              regiao:"Sul" },
  RS:{ nome:"Rio Grande do Sul",   regiao:"Sul" },
  SC:{ nome:"Santa Catarina",      regiao:"Sul" },
  AC:{ nome:"Acre",                regiao:"Norte" },
  AM:{ nome:"Amazonas",            regiao:"Norte" },
  AP:{ nome:"Amapá",               regiao:"Norte" },
  PA:{ nome:"Pará",                regiao:"Norte" },
  RO:{ nome:"Rondônia",            regiao:"Norte" },
  RR:{ nome:"Roraima",             regiao:"Norte" },
  TO:{ nome:"Tocantins",           regiao:"Norte" },
  AL:{ nome:"Alagoas",             regiao:"Nordeste" },
  BA:{ nome:"Bahia",               regiao:"Nordeste" },
  CE:{ nome:"Ceará",               regiao:"Nordeste" },
  MA:{ nome:"Maranhão",            regiao:"Nordeste" },
  PB:{ nome:"Paraíba",             regiao:"Nordeste" },
  PE:{ nome:"Pernambuco",          regiao:"Nordeste" },
  PI:{ nome:"Piauí",               regiao:"Nordeste" },
  RN:{ nome:"Rio Grande do Norte", regiao:"Nordeste" },
  SE:{ nome:"Sergipe",             regiao:"Nordeste" },
  DF:{ nome:"Distrito Federal",    regiao:"Centro-Oeste" },
  GO:{ nome:"Goiás",               regiao:"Centro-Oeste" },
  MS:{ nome:"Mato Grosso do Sul",  regiao:"Centro-Oeste" },
  MT:{ nome:"Mato Grosso",         regiao:"Centro-Oeste" },
};

let estadoAtual;
let lineChart, barChart;
const CHART_TEXT = "#1e3a5f";
const CHART_GRID = "rgba(147,197,253,0.4)";

// ===== AUXILIARES =====
const listaEstados = () => Object.values(DB).filter(e => e.regiao === REGIAO);

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

const estadoCritico = () =>
  listaEstados().reduce((m, e) => e.umidade < m.umidade ? e : m);

function iniciais(nome) {
  return nome.split(" ").slice(0, 2).map(p => p[0]).join("").toUpperCase();
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

function salvarEstado() {
  const nome  = document.getElementById("fNome").value.trim();
  const sigla = document.getElementById("fSigla").value.trim().toUpperCase();
  const ibge  = document.getElementById("fIbge").value.trim();

  if (!nome || !sigla || !ibge)          { alert("Preencha todos os campos."); return; }
  if (sigla.length < 2 || sigla.length > 3) { alert("Sigla deve ter 2 ou 3 letras."); return; }
  if (DB[sigla])                          { alert("Estado já cadastrado."); return; }

  const info = ESTADOS_INFO[sigla];
  if (!info || info.regiao !== REGIAO)   { alert(`${sigla} não pertence à região ${REGIAO}.`); return; }

  SERIE[sigla] = Array.from({ length: 6 }, (_, i) =>
    Math.max(5, (DB[sigla]?.umidade || 20) + (5 - i) * 2));

  fecharModal();
  renderTudo();
}

// ===== MODAL OPÇÕES =====
let tabAtiva = "acessos";

function abrirOpcoes() {
  document.getElementById("opcoesOv").classList.add("open");
  fecharDrawer();
  renderTabelaUsuarios();
  setTab(tabAtiva);
}

function fecharOpcoes() {
  document.getElementById("opcoesOv").classList.remove("open");
}

// Troca a aba visível
function setTab(tab) {
  tabAtiva = tab;

  // Atualiza botões
  document.querySelectorAll(".mopc-nav-btn").forEach(btn =>
    btn.classList.toggle("active", btn.dataset.tab === tab)
  );

  // Mostra/oculta conteúdo
  document.querySelectorAll(".mopc-tab").forEach(el =>
    el.style.display = el.id === `tab-${tab}` ? "block" : "none"
  );
}

// Popula a tabela de usuários
function renderTabelaUsuarios() {
  const tbody = document.getElementById("tbodyUsuarios");
  tbody.innerHTML = "";

  USUARIOS.forEach(u => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <div class="user-cell">
          <div class="user-avatar">${iniciais(u.nome)}</div>
          <div>
            <div class="user-name">${u.nome}</div>
            <div class="user-email">${u.email}</div>
          </div>
        </div>
      </td>
      <td>
        <select class="perm-select" data-id="${u.id}">
          <option value="padrao" ${u.permissao === "padrao" ? "selected" : ""}>Padrão</option>
          <option value="admin"  ${u.permissao === "admin"  ? "selected" : ""}>Admin</option>
        </select>
      </td>
    `;

    // Salva a mudança de permissão no array
    tr.querySelector(".perm-select").addEventListener("change", function () {
      const usuario = USUARIOS.find(x => x.id === +this.dataset.id);
      if (usuario) usuario.permissao = this.value;
    });

    tbody.appendChild(tr);
  });
}

// ===== SENHA =====
function togglePw(inputId, btn) {
  const input = document.getElementById(inputId);
  const isText = input.type === "text";
  input.type = isText ? "password" : "text";
  btn.querySelector("i").className = isText
    ? "fa-regular fa-eye"
    : "fa-regular fa-eye-slash";
}

function salvarSenha() {
  const atual     = document.getElementById("senhaAtual").value;
  const nova      = document.getElementById("novaSenha").value;
  const confirmar = document.getElementById("confirmarSenha").value;

  if (!atual || !nova || !confirmar) { alert("Preencha todos os campos."); return; }
  if (nova.length < 6)               { alert("A nova senha deve ter no mínimo 6 caracteres."); return; }
  if (nova !== confirmar)            { alert("As senhas não coincidem."); return; }

  // Limpa os campos após salvar
  ["senhaAtual", "novaSenha", "confirmarSenha"].forEach(id =>
    document.getElementById(id).value = ""
  );
}

// ===== KPIs =====
function renderKPIs() {
  const lista = listaEstados();
  const maxUmi     = Math.max(...lista.map(e => e.umidade));
  const minUmi     = Math.min(...lista.map(e => e.umidade));
  const criticos   = lista.filter(e => e.umidade < 12).length;
  const internacoes = lista.reduce((s, e) => s + e.internacoes, 0);

  const cards = [
    { label: "Umidade Máxima",   value: maxUmi,     unit: "%", color: cor(maxUmi), info: "A região está 18 pontos abaixo do nível ideal." },
    { label: "Estados Críticos", value: criticos,   unit: "",  color: "#ef4444",   info: "Cenário controlado, sem estados em nível crítico." },
    { label: "Internações",      value: internacoes, unit: "", color: "#2563eb",   info: "12,7% da população precisou de internação." },
    { label: "Umidade Mínima",   value: minUmi,     unit: "%", color: cor(minUmi), info: "Necessário reforço em alertas públicos." },
  ];

  const container = document.getElementById("kpiGrid");
  container.innerHTML = "";

  cards.forEach(card => {
    const div = document.createElement("div");
    div.className = "kpi-card";
    div.style.setProperty("--kc", card.color);
    div.innerHTML = `
      <div class="kpi-label">${card.label}</div>
      <div class="kpi-val" style="color:${card.color}">
        ${card.value}${card.unit ? `<span class="kpi-unit">${card.unit}</span>` : ""}
      </div>
      <div class="kpi-info">${card.info}</div>
    `;
    container.appendChild(div);
  });
}

// ===== MAPA =====
function renderMapa() {
  const container = document.getElementById("mapaCards");
  container.innerHTML = "";

  listaEstados().forEach(e => {
    const card = document.createElement("div");
    card.className = `heat-card${e.sigla === estadoAtual ? " ativo" : ""}`;
    card.style.borderColor = cor(e.umidade);
    card.onclick = () => selecionarEstado(e.sigla);
    card.innerHTML = `
      <span class="hc-sigla">${e.sigla}</span>
      <span class="hc-nome">${e.nome}</span>
      <div class="hc-umi-val">${e.umidade}<span class="hc-umi-unit">%</span></div>
      <div class="hc-bar-track">
        <div class="hc-bar-fill" style="width:${e.umidade}%;background:${cor(e.umidade)}"></div>
      </div>
      <span class="hc-pill">${status(e.umidade)}</span>
    `;
    container.appendChild(card);
  });
}

// ===== STATUS BAR =====
function renderStatus() {
  document.getElementById("estadoStatusBar").innerHTML = `
    <div class="estado-status-bar">
      <div class="esb-estado">${DB[estadoAtual].nome}</div>
    </div>
  `;
}

// ===== GRÁFICO LINHA =====
function renderLinha() {
  const ctx = document.getElementById("lineChart");
  if (lineChart) lineChart.destroy();
  const dados = SERIE[estadoAtual] || Array(24).fill(DB[estadoAtual].umidade);
  const c = cor(DB[estadoAtual].umidade);
  lineChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: SERIE.labels,
      datasets: [{ label: DB[estadoAtual].nome, data: dados,
        borderColor: c, backgroundColor: c + "18",
        pointBackgroundColor: c, tension: 0.3, fill: true }]
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

// ===== GRÁFICO BARRAS SEMANAIS =====
function renderBarras() {
  const ctx = document.getElementById("barChart");
  if (barChart) barChart.destroy();
  const dados = SERIE_SEMANAS[estadoAtual] ||
    Array.from({ length: 4 }, (_, i) => Math.max(5, DB[estadoAtual].umidade + (3 - i) * 2));
  barChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: SERIE_SEMANAS.labels,
      datasets: [{
        label: DB[estadoAtual].nome,
        data: dados,
        backgroundColor: dados.map(v => cor(v) + "cc"),
        borderColor:     dados.map(v => cor(v)),
        borderWidth: 2, borderRadius: 6
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: CHART_TEXT, font: { size: 13, weight: "700" } } },
        tooltip: { callbacks: { label: ctx => ` Média: ${ctx.parsed.y}%` } }
      },
      scales: {
        x: { ticks: { color: CHART_TEXT, font: { size: 12, weight: "600" } }, grid: { color: CHART_GRID } },
        y: { ticks: { color: CHART_TEXT, callback: v => v + "%" }, grid: { color: CHART_GRID } }
      }
    }
  });
}

// ===== TABELA RANKING =====
function renderTabela() {
  const tbody = document.getElementById("rankBody");
  tbody.innerHTML = "";
  listaEstados().sort((a, b) => a.umidade - b.umidade).forEach((e, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td class="td-nm">${e.nome}</td>
      <td>${e.umidade}%</td>
      <td>${e.internacoes.toLocaleString("pt-BR")}</td>
      <td><span class="pill ${classeStatus(e.umidade)}">${status(e.umidade)}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// ===== CONTROLE =====
function selecionarEstado(sigla) { estadoAtual = sigla; renderTudo(); }

function renderTudo() {
  renderKPIs();
  renderStatus();
  renderMapa();
  renderLinha();
  renderBarras();
  renderTabela();
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("nomeGestor").textContent         = GESTOR;
  document.getElementById("regiaoGestor").textContent       = REGIAO;
  document.getElementById("nomeGestorDrawer").textContent   = GESTOR;
  document.getElementById("regiaoGestorDrawer").textContent = REGIAO;

  estadoAtual = estadoCritico().sigla;
  renderTudo();

  // Drawer
  document.getElementById("btnDrawer").addEventListener("click", abrirDrawer);
  document.getElementById("btnFecharDrawer").addEventListener("click", fecharDrawer);
  document.getElementById("drawerOv").addEventListener("click", e => {
    if (e.target === document.getElementById("drawerOv")) fecharDrawer();
  });

  // Modal adicionar estado
  document.getElementById("btnAdmin").addEventListener("click", abrirModal);
  document.getElementById("btnCancelar").addEventListener("click", fecharModal);
  document.getElementById("btnSalvar").addEventListener("click", salvarEstado);
  document.getElementById("modalOv").addEventListener("click", e => {
    if (e.target === document.getElementById("modalOv")) fecharModal();
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
});