# 💧 UmiData — Sistema Inteligente de Monitoramento de Umidade do Ar

> Plataforma analítica que integra dados climáticos e infraestrutura de saúde para apoiar a gestão pública em períodos de baixa umidade do ar nas regiões brasileiras.

---

## 📌 Sobre o Projeto

O **UmiData** nasceu de um problema real: dados climáticos e de saúde pública existem, mas estão dispersos em diferentes bases, formatos e sistemas. Isso torna impossível para gestores públicos tomarem decisões preventivas rápidas durante períodos críticos de baixa umidade.

A plataforma centraliza, trata e visualiza essas informações em dashboards interativos, conectando **criticidade climática** com **capacidade de resposta do sistema de saúde** — em linguagem acessível para quem toma decisões.

---

## 🎯 Problema que Resolvemos

A baixa umidade do ar afeta diretamente a saúde da população brasileira. Durante a estação seca, estados como Mato Grosso, Goiás e o Distrito Federal registram umidade relativa abaixo de 20% — chegando a 7% em casos extremos (Brasília, 2023/2024). Isso causa:

- Aumento de internações por doenças respiratórias (asma, bronquite, DPOC)
- Sobrecarga do sistema SUS (incremento de 20% a 35% em internações nos estados mais afetados)
- Decisões reativas por parte dos gestores públicos, tomadas apenas quando o problema já está evidente

**O UmiData transforma dados públicos fragmentados em inteligência estratégica para o setor público.**

---

## 🚀 Funcionalidades

- 🗺️ **Mapa dinâmico interativo** com níveis de umidade por estado/região
- 📊 **Dashboards analíticos** com KPIs de umidade e internações hospitalares
- 🔔 **Sistema de alertas** baseado nas classificações da OMS (Normal / Atenção / Alerta / Emergência / Crítico)
- 👤 **Gestão de usuários** com autenticação e controle de acesso por cargo
- 📧 **Notificações por e-mail** (Java Mailer) para eventos críticos
- 📈 **Evolução histórica** da umidade por estado com gráficos comparativos
- 🏆 **Ranking de criticidade** por região

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Backend | Java (Spring Boot) |
| Banco de Dados | MySQL |
| Frontend / Dashboard | Node.js + Web Data Viz |
| Infraestrutura | AWS EC2 + S3 |
| Dados climáticos | INMET (CSV via S3) |
| Dados de saúde | DataSUS / CNES |
| Containerização | Docker (JAR + Node containers) |
| E-mail | Java Mailer |
| Agendamento | CRON |
| Design / Prototipação | Figma + Canva |
| Versionamento | GitHub |

---

## 🏗️ Arquitetura

```
[INMET / DataSUS]
       ↓
  [AWS S3 - CSV]
       ↓
[EC2 - Container JAR]  ← Apache POI / JDBC / CRON / Java Mailer
       ↓
  [Banco de Dados MySQL]
       ↓
[EC2 - Container Node.js / Web Data Viz]
       ↓
   [Cliente / Navegador] ← Java Mailer (e-mail de alertas)
```

---

## 📋 Classificação de Umidade (OMS)

| Nível | Classificação | Risco |
|---|---|---|
| Acima de 60% | ✅ Ideal | Mínimo |
| 30% – 60% | 🟡 Atenção | Desconforto inicial |
| 20% – 30% | 🟠 Alerta | Agravamento de rinite, asma |
| 12% – 20% | 🔴 Emergência | Crises respiratórias graves |
| Abaixo de 12% | ⚫ Crítico | Emergência de saúde pública |

---

## 🗄️ Modelo de Dados (MER)

As principais entidades do sistema são:

- **Região** → possui vários **Estados**
- **Estado** → registra várias **Medidas** (umidade + dataHora) e **Internações**
- **Usuário** → vinculado a uma **Empresa Governamental** e um **Cargo**
- **Log do Sistema** → rastreia ações e eventos por usuário

---

## 📅 Metodologia

O projeto foi desenvolvido com **Scrum**, dividido em 3 sprints:

| Sprint | Pontos Fibonacci | Entregue | Pendente |
|---|---|---|---|
| Sprint 1 | 348 | 200 | 106 |
| Sprint 2 | 94 | 94 | 0 ✅ |
| Sprint 3 | 66 | 0 | 66 |
| **Total** | **508** | **294** | **172** |

---

## 👥 Equipe

| Nome | RA |
|---|---|
| Cauã Gama | 01252081 |
| Igor Felix | 01252072 |
| Paulo Gonçalves | 01252109 |
| Sabrina Araujo | 01252128 |
| Tiago Silva | 01252133 |
| Vitor Lima | 01252131 |

**Turma:** 2ADSA — São Paulo Tech School — 2026/1

---

## 📚 Fontes de Dados

- [INMET](https://portal.inmet.gov.br) — dados climáticos e estações meteorológicas
- [DataSUS / CNES](https://datasus.saude.gov.br) — infraestrutura e internações hospitalares
- [IBGE](https://www.ibge.gov.br) — estimativas populacionais por estado

---

## ⚠️ Limitações do Escopo

O UmiData **não contempla**:
- Execução direta de políticas públicas
- Dados clínicos individuais de pacientes
- Modelagem meteorológica de longo prazo
- Monitoramento de outros fatores climáticos (poluição, UV, etc.)

---

> *"O desafio não está em obter dados, mas em transformá-los em inteligência prática para apoiar decisões públicas em tempo oportuno."*
