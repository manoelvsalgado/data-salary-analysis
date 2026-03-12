# Data Salary Analysis

Dashboard interativo para análise de salários na área de dados, desenvolvido com React, TypeScript e Chakra UI.

## Stack

- React + TypeScript
- Chakra UI
- Recharts
- PapaParse
- Vite

## Funcionalidades

- Filtros por ano, senioridade, tipo de contrato e tamanho da empresa
- KPIs: salário médio, salário máximo, total de registros e cargo mais frequente
- Gráficos:
  - Top 10 cargos por salário médio
  - Distribuição de salários
  - Proporção dos tipos de trabalho
  - Top países para Data Scientist por média salarial
- Tabela com dados detalhados filtrados

## Executar localmente

```bash
git clone https://github.com/manoelvsalgado/data-salary-analysis.git
cd data-salary-analysis
npm install
npm run dev
```

## Build de produção

```bash
npm run build
npm run preview
```

## Deploy no GitHub Pages

Este repositório já possui workflow para deploy automático em GitHub Pages:

- Arquivo: `.github/workflows/deploy-pages.yml`
- Trigger: push na branch `main`

### Habilitar no GitHub

1. Acesse o repositório no GitHub.
2. Vá em **Settings > Pages**.
3. Em **Source**, selecione **GitHub Actions**.
4. Faça push na branch `main`.
5. Aguarde o workflow concluir em **Actions**.

URL esperada:

`https://manoelvsalgado.github.io/data-salary-analysis/`

## Scripts

- `npm run dev`: ambiente de desenvolvimento
- `npm run build`: build de produção
- `npm run preview`: pré-visualizar build local
- `npm run deploy`: deploy manual com `gh-pages` (opcional)
