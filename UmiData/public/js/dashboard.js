// ===== CONFIG =====
const GESTOR = "Cauã";
const REGIAO = "Sudeste";

// ===== DADOS =====
const DB = {
  ES: {
    nome: "Espírito Santo",
    sigla: "ES",
    ibge: "32",
    regiao: "Sudeste",
    umidade: 42,
    internacoes: 1100,
    hospitais: 340
  },


  MG: {
    nome: "Minas Gerais",
    sigla: "MG",
    ibge: "31",
    regiao: "Sudeste",
    umidade: 22,
    internacoes: 3700,
    hospitais: 980
  },

  RJ: {
    nome: "Rio de Janeiro",
    sigla: "RJ",
    ibge: "33",
    regiao: "Sudeste",
    umidade: 28,
    internacoes: 3100,
    hospitais: 820
  },

  SP: {
    nome: "São Paulo",
    sigla: "SP",
    ibge: "35",
    regiao: "Sudeste",
    umidade: 18,
    internacoes: 4820,
    hospitais: 1250
  },
};

// ===== SÉRIES =====
const SERIE = {
  labels: Array.from({ length: 24 }, (_, i) => `${i}h`),

  ES: [48, 46, 45, 44, 43, 42],
  MG: [30, 28, 26, 24, 23, 22],
  RJ: [38, 36, 34, 32, 30, 28],
  SP: [30, 26, 23, 21, 19, 18],
};

let estadoAtual;
let lineChart;
let barChart;

// ===== CORES =====
const CHART_TEXT = "#1e3a5f";
const CHART_GRID = "rgba(147,197,253,0.35)";

// ===== REGIÕES =====
const REGIOES = {
  Sudeste: ["ES", "MG", "RJ", "SP"],
  Sul: ["PR", "RS", "SC"],
  Norte: ["AC", "AM", "AP", "PA", "RO", "RR", "TO"],
  Nordeste: ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"],
  "Centro-Oeste": ["DF", "GO", "MS", "MT"],
};

// ===== ESTADOS =====
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

// ===== AUX =====

function listaEstados() {
  return Object.values(DB)
    .filter(e => e.regiao === REGIAO);
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

function classeStatus(u) {

  if (u < 12) return "pill-c";

  if (u < 20) return "pill-e";

  if (u < 30) return "pill-a";

  if (u <= 60) return "pill-t";

  return "pill-n";
}

function estadoCritico() {

  return listaEstados().reduce((menor, atual) =>
    atual.umidade < menor.umidade ? atual : menor
  );
}

// ===== DRAWER =====

function abrirDrawer() {

  document
    .getElementById("drawer")
    .classList.add("open");

  document
    .getElementById("drawerOv")
    .classList.add("open");
}

function fecharDrawer() {

  document
    .getElementById("drawer")
    .classList.remove("open");

  document
    .getElementById("drawerOv")
    .classList.remove("open");
}

// ===== KPI =====

function renderKPIs() {

  const lista = listaEstados();

  const criticos =
    lista.filter(e => e.umidade < 12).length;

  const internacoes =
    lista.reduce((soma, e) =>
      soma + e.internacoes, 0);

  const maxUmi =
    Math.max(...lista.map(e => e.umidade));

  const minUmi =
    Math.min(...lista.map(e => e.umidade));

  const container =
    document.getElementById("kpiGrid");

  container.innerHTML = "";

  const cards = [

    {
      label: "Umidade Máxima",
      value: maxUmi,
      unit: "%",
      color: cor(maxUmi),
      info: "A região está 18 pontos abaixo do nível ideal."
    },

    {
      label: "Estados Críticos",
      value: criticos,
      unit: "",
      color: "#ef4444",
      info: "Cenário controlado, sem estados em nível crítico."
    },

    {
      label: "Internações",
      value: internacoes.toLocaleString("pt-BR"),
      unit: "",
      color: "#2563eb",
      info: "12,7% da população precisou de internação."
    },

    {
      label: "Umidade Mínima",
      value: minUmi,
      unit: "%",
      color: cor(minUmi),
      info: "Necessário reforço em alertas públicos."
    }
  ];

  cards.forEach(card => {

    const cardDiv =
      document.createElement("div");

    cardDiv.className = "kpi-card";

    cardDiv.style.setProperty(
      "--kc",
      card.color
    );

    cardDiv.innerHTML = `
      <div class="kpi-label">
        ${card.label}
      </div>

      <div class="kpi-val" style="color:${card.color}">
        ${card.value}
        ${card.unit ? `<span class="kpi-unit">${card.unit}</span>` : ""}
      </div>

      <div class="kpi-info">
        ${card.info}
      </div>
    `;

    container.appendChild(cardDiv);
  });
}

// ===== MAPA =====

function renderMapa() {

  const lista = listaEstados();

  const container =
    document.getElementById("mapaCards");

  container.innerHTML = "";

  lista.forEach(e => {

    const card =
      document.createElement("div");

    card.className = "heat-card";

    card.style.borderColor =
      cor(e.umidade);

    card.onclick = () =>
      selecionarEstado(e.sigla);

    card.innerHTML = `
      <span class="hc-sigla">
        ${e.sigla}
      </span>

      <span class="hc-nome">
        ${e.nome}
      </span>

      <div class="hc-umi-val">
        ${e.umidade}
        <span class="hc-umi-unit">%</span>
      </div>

      <div class="hc-bar-track">
        <div
          class="hc-bar-fill"
          style="
            width:${e.umidade}%;
            background:${cor(e.umidade)};
          "
        ></div>
      </div>

      <span class="hc-pill">
        ${status(e.umidade)}
      </span>
    `;

    container.appendChild(card);
  });
}

// ===== STATUS =====

function renderStatus() {

  const e = DB[estadoAtual];

  document.getElementById(
    "estadoStatusBar"
  ).innerHTML = `
    <div class="estado-status-bar">
      <div class="esb-estado">
        ${e.nome}
      </div>
    </div>
  `;
}

// ===== GRÁFICO LINHA =====

function renderLinha() {

  const ctx =
    document.getElementById("lineChart");

  if (lineChart)
    lineChart.destroy();

  const dados =
    SERIE[estadoAtual] ||
    Array(24).fill(DB[estadoAtual].umidade);

  const corAtual =
    cor(DB[estadoAtual].umidade);

  lineChart = new Chart(ctx, {

    type: "line",

    data: {

      labels: SERIE.labels,

      datasets: [{
        label: DB[estadoAtual].nome,

        data: dados,

        borderColor: corAtual,

        backgroundColor:
          corAtual + "20",

        pointBackgroundColor:
          corAtual,

        pointRadius: 4,

        borderWidth: 3,

        tension: 0.35,

        fill: true,
      }]
    },

    options: {

      responsive: true,

      maintainAspectRatio: false,

      plugins: {

        legend: {

          labels: {

            color: CHART_TEXT,

            font: {
              size: 14,
              weight: "700"
            }
          }
        }
      },

      scales: {

        x: {

          ticks: {

            color: CHART_TEXT,

            font: {
              size: 13
            }
          },

          grid: {
            color: CHART_GRID
          }
        },

        y: {

          ticks: {

            color: CHART_TEXT,

            font: {
              size: 13
            }
          },

          grid: {
            color: CHART_GRID
          }
        }
      }
    }
  });
}

// ===== GRÁFICO BARRA =====

function renderBarras() {

  const ctx =
    document.getElementById("barChart");

  if (barChart)
    barChart.destroy();

  const lista =
    listaEstados();

  barChart = new Chart(ctx, {

    type: "bar",

    data: {

      labels:
        lista.map(e => e.sigla),

      datasets: [{

        label: "Umidade",

        data:
          lista.map(e => e.umidade),

        backgroundColor:
          lista.map(e =>
            cor(e.umidade) + "cc"
          ),

        borderColor:
          lista.map(e =>
            cor(e.umidade)
          ),

        borderWidth: 2,

        borderRadius: 6,
      }]
    },

    options: {

      responsive: true,

      maintainAspectRatio: false,

      plugins: {

        legend: {

          labels: {

            color: CHART_TEXT,

            font: {
              size: 14,
              weight: "700"
            }
          }
        }
      },

      scales: {

        x: {

          ticks: {

            color: CHART_TEXT,

            font: {
              size: 13,
              weight: "600"
            }
          },

          grid: {
            color: CHART_GRID
          }
        },

        y: {

          ticks: {

            color: CHART_TEXT,

            font: {
              size: 13
            }
          },

          grid: {
            color: CHART_GRID
          }
        }
      }
    }
  });
}

// ===== TABELA =====

function renderTabela() {

  const lista =
    listaEstados()
      .sort((a, b) =>
        a.umidade - b.umidade
      );

  const tbody =
    document.getElementById("rankBody");

  tbody.innerHTML = "";

  lista.forEach((e, i) => {

    const tr =
      document.createElement("tr");

    tr.innerHTML = `
      <td>${i + 1}</td>

      <td class="td-nm">
        ${e.nome}
      </td>

      <td>
        ${e.umidade}%
      </td>

      <td>
        ${e.internacoes.toLocaleString("pt-BR")}
      </td>

      <td>
        <span class="pill ${classeStatus(e.umidade)}">
          ${status(e.umidade)}
        </span>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// ===== MODAL =====

function abrirModal() {

  document
    .getElementById("modalOv")
    .classList.add("open");

  fecharDrawer();
}

function fecharModal() {

  document
    .getElementById("modalOv")
    .classList.remove("open");
}

// ===== TOAST =====

function mostrarToast(msg) {

  const toast =
    document.getElementById("toast");

  toast.textContent = msg;

  toast.style.display = "block";

  setTimeout(() => {

    toast.style.display = "none";

  }, 3000);
}

// ===== SALVAR =====

function salvarEstado() {

  const nome =
    document
      .getElementById("fNome")
      .value
      .trim();

  const sigla =
    document
      .getElementById("fSigla")
      .value
      .trim()
      .toUpperCase();

  const ibge =
    document
      .getElementById("fIbge")
      .value
      .trim();

  if (!nome || !sigla || !ibge) {

    alert("Preencha todos os campos.");

    return;
  }

  if (DB[sigla]) {

    alert("Estado já existe.");

    return;
  }

  const info =
    ESTADOS_INFO[sigla];

  if (!info) {

    alert("Sigla inválida.");

    return;
  }

  if (info.regiao !== REGIAO) {

    alert(
      `${sigla} não pertence à região ${REGIAO}.`
    );

    return;
  }

  const umidade =
    Math.floor(Math.random() * 70) + 10;

  DB[sigla] = {

    nome,
    sigla,
    ibge,

    regiao: REGIAO,

    umidade,

    internacoes:
      Math.floor(Math.random() * 5000),

    hospitais:
      Math.floor(Math.random() * 1500),
  };

  SERIE[sigla] =
    Array.from(
      { length: 24 },
      () =>
        Math.floor(Math.random() * 60) + 10
    );

  fecharModal();

  mostrarToast(
    `${nome} adicionado com sucesso`
  );

  renderTudo();
}

// ===== CONTROLE =====

function selecionarEstado(sigla) {

  estadoAtual = sigla;

  renderTudo();
}

// ===== RENDER =====

function renderTudo() {

  renderKPIs();

  renderStatus();

  renderMapa();

  renderLinha();

  renderBarras();

  renderTabela();
}

// ===== INIT =====

document.addEventListener(
  "DOMContentLoaded",
  () => {

    document.getElementById(
      "nomeGestor"
    ).textContent = GESTOR;

    document.getElementById(
      "regiaoGestor"
    ).textContent = REGIAO;

    document.getElementById(
      "nomeGestorDrawer"
    ).textContent = GESTOR;

    document.getElementById(
      "regiaoGestorDrawer"
    ).textContent = REGIAO;

    estadoAtual =
      estadoCritico().sigla;

    renderTudo();

    // Drawer
    document
      .getElementById("btnDrawer")
      .addEventListener(
        "click",
        abrirDrawer
      );

    document
      .getElementById("btnFecharDrawer")
      .addEventListener(
        "click",
        fecharDrawer
      );

    document
      .getElementById("drawerOv")
      .addEventListener(
        "click",
        fecharDrawer
      );

    // Modal
    document
      .getElementById("btnAdmin")
      .addEventListener(
        "click",
        abrirModal
      );

    document
      .getElementById("btnCancelar")
      .addEventListener(
        "click",
        fecharModal
      );

    document
      .getElementById("btnSalvar")
      .addEventListener(
        "click",
        salvarEstado
      );

    document
      .getElementById("modalOv")
      .addEventListener(
        "click",
        e => {

          if (
            e.target ===
            document.getElementById("modalOv")
          ) {
            fecharModal();
          }
        }
      );
  }
);