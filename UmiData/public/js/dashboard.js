// ===== CONFIG =====
const GESTOR = "Cauã";
const REGIAO = "Sudeste";

// ===== DADOS =====
const DB = {
  ES: { nome: "Espírito Santo", sigla: "ES", ibge: "32", regiao: "Sudeste", umidade: 42, internacoes: 1100, hospitais: 340 },
  MG: { nome: "Minas Gerais", sigla: "MG", ibge: "31", regiao: "Sudeste", umidade: 22, internacoes: 3700, hospitais: 980 },
  RJ: { nome: "Rio de Janeiro", sigla: "RJ", ibge: "33", regiao: "Sudeste", umidade: 28, internacoes: 3100, hospitais: 820 },
  SP: { nome: "São Paulo", sigla: "SP", ibge: "35", regiao: "Sudeste", umidade: 18, internacoes: 4820, hospitais: 1250 },
};

const SERIE = {
  labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
  ES: [48, 46, 45, 44, 43, 42],
  MG: [30, 28, 26, 24, 23, 22],
  RJ: [38, 36, 34, 32, 30, 28],
  SP: [30, 26, 23, 21, 19, 18],
};

let estadoAtual;
let lineChart, barChart;

// ===== CORES GRÁFICOS =====
const CHART_TEXT = "#1e3a5f";
const CHART_GRID = "rgba(147,197,253,0.4)";

// ===== DADOS ADICIONAIS =====
const REGIOES = {
  Sudeste: ["ES", "MG", "RJ", "SP"],
  Sul: ["PR", "RS", "SC"],
  Norte: ["AC", "AM", "AP", "PA", "RO", "RR", "TO"],
  Nordeste: ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"],
  "Centro-Oeste": ["DF", "GO", "MS", "MT"],
};

const ESTADOS_INFO = {
  ES: { nome: "Espírito Santo", regiao: "Sudeste" },
  MG: { nome: "Minas Gerais", regiao: "Sudeste" },
  RJ: { nome: "Rio de Janeiro", regiao: "Sudeste" },
  SP: { nome: "São Paulo", regiao: "Sudeste" },
  PR: { nome: "Paraná", regiao: "Sul" },
  RS: { nome: "Rio Grande do Sul", regiao: "Sul" },
  SC: { nome: "Santa Catarina", regiao: "Sul" },
  AC: { nome: "Acre", regiao: "Norte" },
  AM: { nome: "Amazonas", regiao: "Norte" },
  AP: { nome: "Amapá", regiao: "Norte" },
  PA: { nome: "Pará", regiao: "Norte" },
  RO: { nome: "Rondônia", regiao: "Norte" },
  RR: { nome: "Roraima", regiao: "Norte" },
  TO: { nome: "Tocantins", regiao: "Norte" },
  AL: { nome: "Alagoas", regiao: "Nordeste" },
  BA: { nome: "Bahia", regiao: "Nordeste" },
  CE: { nome: "Ceará", regiao: "Nordeste" },
  MA: { nome: "Maranhão", regiao: "Nordeste" },
  PB: { nome: "Paraíba", regiao: "Nordeste" },
  PE: { nome: "Pernambuco", regiao: "Nordeste" },
  PI: { nome: "Piauí", regiao: "Nordeste" },
  RN: { nome: "Rio Grande do Norte", regiao: "Nordeste" },
  SE: { nome: "Sergipe", regiao: "Nordeste" },
  DF: { nome: "Distrito Federal", regiao: "Centro-Oeste" },
  GO: { nome: "Goiás", regiao: "Centro-Oeste" },
  MS: { nome: "Mato Grosso do Sul", regiao: "Centro-Oeste" },
  MT: { nome: "Mato Grosso", regiao: "Centro-Oeste" },
};

// ===== FUNÇÕES AUXILIARES =====
function listaEstados() {
  return Object.values(DB).filter(e => e.regiao === REGIAO);
}

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

function estadoCritico() {
  return listaEstados().reduce((menor, e) =>
    e.umidade < menor.umidade ? e : menor
  );
}

function classeStatus(u) {
  if (u < 12) return "pill-c";
  if (u < 20) return "pill-e";
  if (u < 30) return "pill-a";
  if (u <= 60) return "pill-t";
  return "pill-n";
}

// ===== KPIs - SEM HTML INLINE =====
function renderKPIs() {
  const lista = listaEstados();
  const criticos = lista.filter(e => e.umidade < 12).length;
  const internacoes = lista.reduce((s, e) => s + e.internacoes, 0);
  const maxUmi = Math.max(...lista.map(e => e.umidade));
  const minUmi = Math.min(...lista.map(e => e.umidade));

  const container = document.getElementById("kpiGrid");
  container.innerHTML = "";
  
  // Criando cards via DOM, sem HTML inline
  const cards = [
    { label: "Umidade Máxima", value: maxUmi, unit: "%", color: cor(maxUmi) },
    { label: "Estados Críticos", value: criticos, unit: "", color: "var(--red)" },
    { label: "Internações", value: internacoes, unit: "", color: null },
    { label: "Umidade Mínima", value: minUmi, unit: "%", color: cor(minUmi) }
  ];
  
  cards.forEach(card => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "kpi-card";
    if (card.color) {
      cardDiv.style.setProperty("--kc", card.color);
    }
    
    const labelDiv = document.createElement("div");
    labelDiv.className = "kpi-label";
    labelDiv.textContent = card.label;
    
    const valueDiv = document.createElement("div");
    valueDiv.className = "kpi-val";
    if (card.color) {
      valueDiv.style.color = card.color;
    }
    valueDiv.innerHTML = `${card.value}${card.unit ? `<span class="kpi-unit">${card.unit}</span>` : ""}`;
    
    cardDiv.appendChild(labelDiv);
    cardDiv.appendChild(valueDiv);
    container.appendChild(cardDiv);
  });
}

// ===== MODAL =====
function abrirModal() {
  document.getElementById("fNome").value = "";
  document.getElementById("fSigla").value = "";
  document.getElementById("fIbge").value = "";
  document.getElementById("modalOv").classList.add("open");
}

function fecharModal() {
  document.getElementById("modalOv").classList.remove("open");
}

function mostrarToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.style.display = "block";
  setTimeout(() => { t.style.display = "none"; }, 3000);
}

function salvarEstado() {
  const nome = document.getElementById("fNome").value.trim();
  const sigla = document.getElementById("fSigla").value.trim().toUpperCase();
  const ibge = document.getElementById("fIbge").value.trim();

  if (!nome || !sigla || !ibge) {
    alert("Preencha todos os campos.");
    return;
  }

  if (sigla.length < 2 || sigla.length > 3) {
    alert("Sigla deve ter 2 ou 3 letras.");
    return;
  }

  if (DB[sigla]) {
    alert("Estado já cadastrado.");
    return;
  }

  const info = ESTADOS_INFO[sigla];
  if (!info || info.regiao !== REGIAO) {
    alert(`${sigla} não pertence à região ${REGIAO}.`);
    return;
  }

  SERIE[sigla] = Array.from({ length: 6 }, (_, i) =>
    Math.max(5, DB[sigla].umidade + (5 - i) * 2)
  );

  fecharModal();
  alert(`${nome} adicionado com sucesso!`);
  renderTudo();
}

// ===== MAPA - SEM HTML INLINE =====
function renderMapa() {
  const lista = listaEstados();
  const container = document.getElementById("mapaCards");
  container.innerHTML = "";
  
  lista.forEach(e => {
    const card = document.createElement("div");
    card.className = `heat-card ${e.sigla === estadoAtual ? "ativo" : ""}`;
    card.style.setProperty("--hc", cor(e.umidade));
    card.style.borderColor = cor(e.umidade);
    card.onclick = () => selecionarEstado(e.sigla);
    
    const siglaSpan = document.createElement("span");
    siglaSpan.className = "hc-sigla";
    siglaSpan.textContent = e.sigla;
    
    const nomeSpan = document.createElement("span");
    nomeSpan.className = "hc-nome";
    nomeSpan.textContent = e.nome;
    
    const umiDiv = document.createElement("div");
    umiDiv.className = "hc-umi-val";
    umiDiv.innerHTML = `${e.umidade}<span class="hc-umi-unit">%</span>`;
    
    const trackDiv = document.createElement("div");
    trackDiv.className = "hc-bar-track";
    
    const fillDiv = document.createElement("div");
    fillDiv.className = "hc-bar-fill";
    fillDiv.style.width = `${e.umidade}%`;
    fillDiv.style.background = cor(e.umidade);
    trackDiv.appendChild(fillDiv);
    
    const pillSpan = document.createElement("span");
    pillSpan.className = "hc-pill";
    pillSpan.textContent = status(e.umidade);
    
    card.appendChild(siglaSpan);
    card.appendChild(nomeSpan);
    card.appendChild(umiDiv);
    card.appendChild(trackDiv);
    card.appendChild(pillSpan);
    container.appendChild(card);
  });
}

// ===== STATUS BAR - SEM HTML INLINE =====
function renderStatus() {
  const e = DB[estadoAtual];
  const container = document.getElementById("estadoStatusBar");
  container.innerHTML = "";
  
  const barDiv = document.createElement("div");
  barDiv.className = "estado-status-bar";
  
  const estadoDiv = document.createElement("div");
  estadoDiv.className = "esb-estado";
  estadoDiv.textContent = e.nome;
  
  barDiv.appendChild(estadoDiv);
  container.appendChild(barDiv);
}

// ===== GRÁFICOS =====
function renderLinha() {
  const ctx = document.getElementById("lineChart");
  if (lineChart) lineChart.destroy();

  const dados = SERIE[estadoAtual] || Array(24).fill(DB[estadoAtual].umidade);
  const corAtual = cor(DB[estadoAtual].umidade);

  lineChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: SERIE.labels,
      datasets: [{
        label: DB[estadoAtual].nome,
        data: dados,
        borderColor: corAtual,
        backgroundColor: corAtual + "18",
        pointBackgroundColor: corAtual,
        tension: 0.3,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: CHART_TEXT }
        }
      },
      scales: {
        x: { ticks: { color: CHART_TEXT } },
        y: { ticks: { color: CHART_TEXT } }
      }
    }
  });
}

function renderBarras() {
  const ctx = document.getElementById("barChart");
  if (barChart) barChart.destroy();

  const lista = listaEstados();

  barChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: lista.map(e => e.sigla),
      datasets: [{
        label: "Umidade",
        data: lista.map(e => e.umidade),
        backgroundColor: lista.map(e => cor(e.umidade) + "cc"),
        borderColor: lista.map(e => cor(e.umidade)),
        borderWidth: 1.5,
        borderRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: CHART_TEXT } }
      },
      scales: {
        x: { ticks: { color: CHART_TEXT }, grid: { color: CHART_GRID } },
        y: { ticks: { color: CHART_TEXT }, grid: { color: CHART_GRID } }
      }
    }
  });
}

// ===== TABELA - SEM HTML INLINE =====
function renderTabela() {
  const lista = listaEstados().sort((a, b) => a.umidade - b.umidade);
  const tbody = document.getElementById("rankBody");
  tbody.innerHTML = "";
  
  lista.forEach((e, i) => {
    const tr = document.createElement("tr");
    
    const tdRank = document.createElement("td");
    tdRank.textContent = i + 1;
    
    const tdNome = document.createElement("td");
    tdNome.className = "td-nm";
    tdNome.textContent = e.nome;
    
    const tdUmi = document.createElement("td");
    tdUmi.textContent = `${e.umidade}%`;
    
    const tdInternacoes = document.createElement("td");
    tdInternacoes.textContent = e.internacoes;
    
    const tdStatus = document.createElement("td");
    const pillSpan = document.createElement("span");
    pillSpan.className = `pill ${classeStatus(e.umidade)}`;
    pillSpan.textContent = status(e.umidade);
    tdStatus.appendChild(pillSpan);
    
    tr.appendChild(tdRank);
    tr.appendChild(tdNome);
    tr.appendChild(tdUmi);
    tr.appendChild(tdInternacoes);
    tr.appendChild(tdStatus);
    tbody.appendChild(tr);
  });
}

// ===== CONTROLE =====
function selecionarEstado(sigla) {
  estadoAtual = sigla;
  renderTudo();
}

// ===== RENDER PRINCIPAL =====
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
  document.getElementById("nomeGestor").textContent = GESTOR;
  document.getElementById("regiaoGestor").textContent = REGIAO;

  estadoAtual = estadoCritico().sigla;
  renderTudo();

  document.getElementById("btnAdmin").addEventListener("click", abrirModal);
  document.getElementById("btnCancelar").addEventListener("click", fecharModal);
  document.getElementById("btnSalvar").addEventListener("click", salvarEstado);

  document.getElementById("modalOv").addEventListener("click", e => {
    if (e.target === document.getElementById("modalOv")) fecharModal();
  });
});