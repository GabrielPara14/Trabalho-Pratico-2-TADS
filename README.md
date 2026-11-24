# Trabalho Prático 2 — Front-end da Locadora de Veículos

Front-end integrado ao back-end construído no **Trabalho Prático 1**
([repositório do TP1](https://github.com/GabrielPara14/Trabalho-Pratico-1-TADS)).

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `trabalho pratico 1/` | Back-end do TP1: API ASP.NET Core + Entity Framework + SQL Server Express (banco `LocadoraDb`) |
| `frontend/` | Front-end em HTML, CSS, JavaScript e Bootstrap, consumindo a API com `fetch` |

## Wireframes

Wireframes de média fidelidade, em tons de cinza, feitos no Figma:
<https://www.figma.com/design/rasTZVLQpKFrXRCJW2b0CL>

| Tela | Conteúdo |
|---|---|
| Início | Painel com o total de cada entidade, aluguéis em aberto e atalhos para os relatórios |
| Fabricantes, Veículos, Clientes, Aluguéis, Manutenções | Listagem vinda da API, filtros em 2 ou mais campos, botões de novo, editar e excluir |
| Modal de cadastro/edição | Formulário que envia `POST` (novo) ou `PUT` (edição) |
| Modal de exclusão | Confirmação antes do `DELETE` |
| Relatórios | Consultas com JOIN do TP1 (`/api/relatorios/...`) em abas, com filtros, gráfico de barras e tabela |

## Como rodar

1. Ligue o SQL Server Express (`.\SQLEXPRESS`).
2. Na pasta `trabalho pratico 1/trabalho pratico 1`, rode `dotnet run --launch-profile http`
   (a API sobe em `http://localhost:5210`).
3. Abra o front-end da pasta `frontend/` no navegador.
