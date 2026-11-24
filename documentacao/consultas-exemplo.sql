-- Consultas usadas como exemplo na apresentação (banco LocadoraDb).
-- São o equivalente em SQL das consultas LINQ do RelatoriosController do TP1.

-- Exemplo 1: gasto de manutenção por fabricante (JOIN + GROUP BY)
-- Rota: GET /api/relatorios/gastos-manutencao-por-fabricante
SELECT f.Nome AS Fabricante,
       SUM(m.ValorGasto) AS TotalGasto,
       COUNT(*) AS QtdManutencoes
FROM Fabricantes f
JOIN Veiculos v ON v.FabricanteId = f.Id
JOIN Manutencoes m ON m.VeiculoId = v.Id
GROUP BY f.Nome
ORDER BY TotalGasto DESC;

-- Exemplo 2: clientes com e sem aluguel (LEFT JOIN)
-- Rota: GET /api/relatorios/clientes-alugueis
SELECT c.Nome AS Cliente,
       c.CPF,
       CASE WHEN a.Id IS NULL THEN 'Não' ELSE 'Sim' END AS AluguelRegistrado,
       a.DataInicio,
       ISNULL(a.ValorTotal, 0) AS ValorTotal
FROM Clientes c
LEFT JOIN Alugueis a ON a.ClienteId = c.Id
ORDER BY c.Nome;
