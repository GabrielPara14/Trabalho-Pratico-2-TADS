# Trabalho Prático 2 — Front-end da Locadora de Veículos (AutoGiro)

Front-end integrado ao back-end construído no **Trabalho Prático 1**
([repositório do TP1](https://github.com/GabrielPara14/Trabalho-Pratico-1-TADS)).
Nenhum dado é fixo no front-end: tudo é lido e gravado na API com `fetch`.

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `trabalho pratico 1/` | Back-end do TP1: API ASP.NET Core + Entity Framework + SQL Server Express (banco `LocadoraDb`). Única mudança: CORS liberado para o front-end |
| `frontend/` | Front-end em HTML, CSS, JavaScript e Bootstrap 5 |
| `frontend/js/api.js` | Funções de `fetch` (GET, POST, PUT, DELETE) e formatação |
| `frontend/js/layout.js` | Barra lateral, topo, diálogo de exclusão e avisos de todas as páginas |
| `frontend/js/*.js` | Um arquivo por tela |
| `documentacao/` | Artigo no modelo SBC (`.pdf` e `.docx`), prints das telas e consultas SQL de exemplo |

## Telas

| Tela | Rota(s) da API | Filtros |
|---|---|---|
| Início (`index.html`) | as 5 rotas de cadastro | — (painel com totais, aluguéis em aberto/atrasados e atividade recente) |
| Fabricantes | `/api/fabricantes` | nome, com/sem veículos, ordenação |
| Veículos | `/api/veiculos` | modelo ou placa, fabricante, faixa de ano, quilometragem máxima |
| Clientes | `/api/clientes` | nome, CPF, e-mail, histórico de aluguéis |
| Aluguéis | `/api/alugueis` | cliente, veículo, situação (em aberto/devolvido), período de início |
| Manutenções | `/api/manutencoes` | veículo, descrição, faixa de valor, período |
| Relatórios | `/api/relatorios/...` (5 consultas com JOIN) | filtros próprios de cada relatório, gráfico de barras, indicadores e tabela |

Em todas as telas de cadastro: **gaveta lateral** para cadastrar (`POST`) e editar (`PUT`),
e **diálogo de confirmação** antes de excluir (`DELETE`).

## Wireframes

Wireframes de média fidelidade, em tons de cinza, feitos no Figma:
<https://www.figma.com/design/rasTZVLQpKFrXRCJW2b0CL>

Layout: barra lateral escura com o menu, conteúdo com título, tabela zebrada e painel de filtros
à direita; cadastro/edição em gaveta lateral e exclusão em diálogo centralizado.

## Como rodar

1. Ligue o SQL Server Express (`.\SQLEXPRESS`).
2. Na pasta `trabalho pratico 1/trabalho pratico 1`, rode `dotnet run --launch-profile http`
   (a API sobe em `http://localhost:5210`).
3. Abra a pasta `frontend/` com o Live Server do VS Code (ou qualquer servidor estático)
   e acesse `index.html`. O topo da página mostra se a API está conectada.
