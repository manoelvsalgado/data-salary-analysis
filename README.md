# Dashboard de Salários na Área de Dados

Dashboard interativo desenvolvido com **Python + Streamlit** para explorar salários na área de dados, com filtros dinâmicos e visualizações em **Plotly**.

## Visão geral

Este projeto permite analisar dados salariais por:

- Ano
- Senioridade
- Tipo de contrato
- Tamanho da empresa

Além dos filtros, o dashboard apresenta:

- KPIs (salário médio, salário máximo, total de registros e cargo mais frequente)
- Top 10 cargos por salário médio
- Distribuição de salários
- Proporção dos tipos de trabalho
- Mapa de salário médio de Cientista de Dados por país

## Tecnologias utilizadas

- Python
- Streamlit
- Pandas
- Plotly Express

## Como executar localmente

### 1) Clonar o repositório

```bash
git clone https://github.com/manoelvsalgado/data-salary-analysis.git
cd data-salary-analysis
```

### 2) Criar e ativar ambiente virtual (Linux/macOS)

```bash
python -m venv .venv
source .venv/bin/activate
```

### 3) Instalar dependências

```bash
pip install -r requirements.txt
```

### 4) Rodar aplicação

```bash
streamlit run app.py
```

## Deploy no Streamlit Community Cloud

1. Faça push do projeto para o GitHub.
2. Acesse: https://share.streamlit.io/
3. Clique em **New app**.
4. Selecione seu repositório.
5. Configure:
	- **Branch**: `main`
	- **Main file path**: `app.py`
6. Clique em **Deploy**.

Ao finalizar, você terá uma URL pública para adicionar no portfólio.

## Como apresentar no portfólio

### Título do projeto

Dashboard de Salários na Área de Dados

### Descrição curta (pronta para colar)

Desenvolvi um dashboard interativo para análise de salários em dados, com filtros por ano, senioridade, contrato e tamanho da empresa. A solução foi construída com Python, Streamlit, Pandas e Plotly para facilitar a exploração de tendências salariais globais e apoiar análises rápidas com visualizações claras.

### Principais destaques

- Interface interativa para exploração de dados
- Visualizações analíticas com foco em tomada de decisão
- Publicação web com Streamlit Cloud

### Links para incluir

- **Demo:** `https://SEU-APP.streamlit.app`
- **Código:** `https://github.com/manoelvsalgado/data-salary-analysis`

## Estrutura do projeto

```bash
.
├── app.py
├── requirements.txt
├── runtime.txt
└── README.md
```

## Melhorias futuras (opcional)

- Exportação dos dados filtrados em CSV
- Comparação de métricas entre anos
- Inclusão de novos indicadores salariais