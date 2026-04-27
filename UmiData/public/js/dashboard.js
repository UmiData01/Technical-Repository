// ===== CONFIG =====
const GESTOR = "Cauã";
const REGIAO = "Sudeste";

// ===== DADOS =====
const DB = {
  ES:{ nome:"Espírito Santo", sigla:"ES", ibge:"32", regiao:"Sudeste", umidade:42, internacoes:1100, hospitais:340 },
  MG:{ nome:"Minas Gerais", sigla:"MG", ibge:"31", regiao:"Sudeste", umidade:22, internacoes:3700, hospitais:980 },
  RJ:{ nome:"Rio de Janeiro", sigla:"RJ", ibge:"33", regiao:"Sudeste", umidade:28, internacoes:3100, hospitais:820 },
  SP:{ nome:"São Paulo", sigla:"SP", ibge:"35", regiao:"Sudeste", umidade:18, internacoes:4820, hospitais:1250 },
};

const SERIE = {
  labels:["Sem 1","Sem 2","Sem 3","Sem 4","Sem 5","Atual"],
  ES:[48,46,45,44,43,42],
  MG:[30,28,26,24,23,22],
  RJ:[38,36,34,32,30,28],
  SP:[30,26,23,21,19,18],
};

let estadoAtual;
let lineChart, barChart;


// ===== FUNÇÕES =====
function listaEstados() {
  return Object.values(DB).filter(e => e.regiao === REGIAO);
}

function cor(u) {
  if (u < 15) return "#ef4444";
  if (u < 25) return "#f97316";
  if (u < 40) return "#eab308";
  return "#22c55e";
}

function status(u) {
  if (u < 15) return "CRÍTICO";
  if (u < 25) return "ALERTA";
  if (u < 40) return "ATENÇÃO";
  return "NORMAL";
}

function estadoCritico() {
  return listaEstados().reduce((menor, e) =>
    e.umidade < menor.umidade ? e : menor
  );
}


// ===== KPIs =====
function renderKPIs() {
  const lista = listaEstados();

  const criticos = lista.filter(e => e.umidade < 20).length;
  const internacoes = lista.reduce((s, e) => s + e.internacoes, 0);
  const maxUmi = Math.max(...lista.map(e => e.umidade));
  const minUmi = Math.min(...lista.map(e => e.umidade));

  document.getElementById("kpiGrid").innerHTML = `
  
  <div class="kpi-card" style="--kc:${cor(maxUmi)}">
  <div class="kpi-label">Umidade Máxima</div>
  <div class="kpi-val" style="color:${cor(maxUmi)}">${maxUmi}<span class="kpi-unit">%</span></div>
  </div>
  
  <div class="kpi-card" style="--kc:var(--red)">
  <div class="kpi-label">Estados Críticos</div>
  <div class="kpi-val">${criticos}</div>
  </div>
  
  <div class="kpi-card">
  <div class="kpi-label">Internações</div>
  <div class="kpi-val">${internacoes}</div>
  </div>

  <div class="kpi-card" style="--kc:${cor(minUmi)}">
    <div class="kpi-label">Umidade Mínima</div>
    <div class="kpi-val" style="color:${cor(minUmi)}">${minUmi}<span class="kpi-unit">%</span></div>
  </div>
  `;
}

// ===== MODAL =====
const REGIOES = {
  Sudeste: ["ES","MG","RJ","SP"],
  Sul:     ["PR","RS","SC"],
  Norte:   ["AC","AM","AP","PA","RO","RR","TO"],
  Nordeste:["AL","BA","CE","MA","PB","PE","PI","RN","SE"],
  "Centro-Oeste":["DF","GO","MS","MT"],
};

const ESTADOS_INFO = {
  ES:{ nome:"Espírito Santo",  regiao:"Sudeste"      },
  MG:{ nome:"Minas Gerais",    regiao:"Sudeste"      },
  RJ:{ nome:"Rio de Janeiro",  regiao:"Sudeste"      },
  SP:{ nome:"São Paulo",       regiao:"Sudeste"      },
  PR:{ nome:"Paraná",          regiao:"Sul"          },
  RS:{ nome:"Rio Grande do Sul",regiao:"Sul"         },
  SC:{ nome:"Santa Catarina",  regiao:"Sul"          },
  AC:{ nome:"Acre",            regiao:"Norte"        },
  AM:{ nome:"Amazonas",        regiao:"Norte"        },
  AP:{ nome:"Amapá",           regiao:"Norte"        },
  PA:{ nome:"Pará",            regiao:"Norte"        },
  RO:{ nome:"Rondônia",        regiao:"Norte"        },
  RR:{ nome:"Roraima",         regiao:"Norte"        },
  TO:{ nome:"Tocantins",       regiao:"Norte"        },
  AL:{ nome:"Alagoas",         regiao:"Nordeste"     },
  BA:{ nome:"Bahia",           regiao:"Nordeste"     },
  CE:{ nome:"Ceará",           regiao:"Nordeste"     },
  MA:{ nome:"Maranhão",        regiao:"Nordeste"     },
  PB:{ nome:"Paraíba",         regiao:"Nordeste"     },
  PE:{ nome:"Pernambuco",      regiao:"Nordeste"     },
  PI:{ nome:"Piauí",           regiao:"Nordeste"     },
  RN:{ nome:"Rio Grande do Norte",regiao:"Nordeste"  },
  SE:{ nome:"Sergipe",         regiao:"Nordeste"     },
  DF:{ nome:"Distrito Federal",regiao:"Centro-Oeste" },
  GO:{ nome:"Goiás",           regiao:"Centro-Oeste" },
  MS:{ nome:"Mato Grosso do Sul",regiao:"Centro-Oeste"},
  MT:{ nome:"Mato Grosso",     regiao:"Centro-Oeste" },
};

function abrirModal() {
  document.getElementById("fNome").value  = "";
  document.getElementById("fSigla").value = "";
  document.getElementById("fIbge").value  = "";
  document.getElementById("modalRegiaoInfo").textContent = REGIAO;
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
  const nome  = document.getElementById("fNome").value.trim();
  const sigla = document.getElementById("fSigla").value.trim().toUpperCase();
  const ibge  = document.getElementById("fIbge").value.trim();

  if (!nome || !sigla || !ibge) {
    mostrarToast("⚠ Preencha todos os campos.");
    return;
  }

  if (sigla.length < 2 || sigla.length > 3) {
    mostrarToast("⚠ Sigla deve ter 2 ou 3 letras.");
    return;
  }

  if (DB[sigla]) {
    mostrarToast("⚠ Estado já cadastrado.");
    return;
  }

  const info = ESTADOS_INFO[sigla];
  if (!info || info.regiao !== REGIAO) {
    mostrarToast(`⚠ ${sigla} não pertence à região ${REGIAO}.`);
    return;
  }

  DB[sigla] = {
    nome,
    sigla,
    ibge,
    regiao: REGIAO,
    umidade:     Math.floor(Math.random() * 55) + 10,
    internacoes: Math.floor(Math.random() * 4000) + 500,
    hospitais:   Math.floor(Math.random() * 900) + 200,
  };

  SERIE[sigla] = Array.from({ length: 6 }, (_, i) =>
    Math.max(5, DB[sigla].umidade + (5 - i) * 2)
  );

  fecharModal();
  mostrarToast(`✓ ${nome} adicionado com sucesso!`);
  renderTudo();
}


// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("nomeGestor").textContent   = GESTOR;
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


// ===== MAPA =====
function renderMapa() {
  const lista = listaEstados();

  document.getElementById("mapaCards").innerHTML = lista.map(e => `
    <div class="heat-card ${e.sigla === estadoAtual ? "ativo":""}"
      style="--hc:${cor(e.umidade)}; border-color:${cor(e.umidade)}"
      onclick="selecionarEstado('${e.sigla}')">

      <span class="hc-sigla">${e.sigla}</span>
      <span class="hc-nome">${e.nome}</span>

      <div class="hc-umi-val">
        ${e.umidade}<span class="hc-umi-unit">%</span>
      </div>

      <div class="hc-bar-track">
        <div class="hc-bar-fill" style="width:${e.umidade}%; background:${cor(e.umidade)}"></div>
      </div>

      <span class="hc-pill">${status(e.umidade)}</span>
   
    </div>
  `).join("");
}


// ===== STATUS BAR =====
function renderStatus() {
  const e = DB[estadoAtual];

  document.getElementById("estadoStatusBar").innerHTML = `
    <div class="estado-status-bar">
      <div class="esb-estado">${e.nome}</div>
    
    </div>
  `;
}


// ===== GRÁFICOS =====
function renderLinha() {
  const ctx = document.getElementById("lineChart");

  if (lineChart) lineChart.destroy();

  const dados = SERIE[estadoAtual] || Array(6).fill(DB[estadoAtual].umidade);

  lineChart = new Chart(ctx, {
    type:"line",
    data:{
      labels: SERIE.labels,
      datasets:[{
        label: DB[estadoAtual].nome,
        data: dados,
        borderColor: cor(DB[estadoAtual].umidade)
      }]
    }
  });
}

function renderBarras() {
  const ctx = document.getElementById("barChart");

  if (barChart) barChart.destroy();

  const lista = listaEstados();

  barChart = new Chart(ctx, {
    type:"bar",
    data:{
      labels: lista.map(e=>e.sigla),
      datasets:[{
        label:"Umidade",
        data: lista.map(e=>e.umidade),
        backgroundColor: lista.map(e=>cor(e.umidade))
      }]
    },
    options:{
      plugins:{
        legend:{
          labels:{
            color: "#ffffff"
          }
        }
      }
    },
    scales:{
    x:{ ticks:{ color: "#ffffff" } },
    y:{ ticks:{ color: "#ffffff" } }
  }
  });
}


// ===== TABELA =====
function renderTabela() {
  const lista = listaEstados().sort((a,b)=>a.umidade - b.umidade);

  document.getElementById("rankBody").innerHTML =
    lista.map((e,i)=>`
      <tr>
        <td>${i+1}</td>
        <td class="td-nm">${e.nome}</td>
        <td>${e.umidade}%</td>
        <td>${e.internacoes}</td>
        <td>${status(e.umidade)}</td>
      </tr>
    `).join("");
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


