using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using trabalho_pratico_1.Data;

namespace trabalho_pratico_1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RelatoriosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RelatoriosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("veiculos-fabricantes")]
        public async Task<IActionResult> GetVeiculosComFabricantes()
        {
            var resultado = await (from v in _context.Veiculos
                                   join f in _context.Fabricantes on v.FabricanteId equals f.Id
                                   select new
                                   {
                                       VeiculoId = v.Id,
                                       v.Modelo,
                                       v.Placa,
                                       Fabricante = f.Nome
                                   }).ToListAsync();

            return Ok(resultado);
        }

        [HttpGet("historico-alugueis")]
        public async Task<IActionResult> GetHistoricoAlugueis()
        {
            var resultado = await (from a in _context.Alugueis
                                   join c in _context.Clientes on a.ClienteId equals c.Id
                                   join v in _context.Veiculos on a.VeiculoId equals v.Id
                                   select new
                                   {
                                       AluguelId = a.Id,
                                       Cliente = c.Nome,
                                       c.CPF,
                                       Veiculo = v.Modelo,
                                       v.Placa,
                                       a.DataInicio,
                                       a.DataFimPrevista,
                                       a.ValorTotal
                                   }).ToListAsync();

            return Ok(resultado);
        }

        [HttpGet("clientes-alugueis")]
        public async Task<IActionResult> GetClientesLeftJoinAlugueis()
        {
            var resultado = await (from c in _context.Clientes
                                   join a in _context.Alugueis on c.Id equals a.ClienteId into alugueisGroup
                                   from a in alugueisGroup.DefaultIfEmpty()
                                   select new
                                   {
                                       Cliente = c.Nome,
                                       c.CPF,
                                       AluguelRegistrado = a != null ? "Sim" : "Não",
                                       DataAluguel = a != null ? (DateTime?)a.DataInicio : null,
                                       ValorTotal = a != null ? a.ValorTotal : 0
                                   }).ToListAsync();

            return Ok(resultado);
        }

        [HttpGet("veiculos-manutencoes")]
        public async Task<IActionResult> GetVeiculosLeftJoinManutencoes()
        {
            var resultado = await (from v in _context.Veiculos
                                   join m in _context.Manutencoes on v.Id equals m.VeiculoId into manutencoesGroup
                                   from m in manutencoesGroup.DefaultIfEmpty()
                                   select new
                                   {
                                       v.Modelo,
                                       v.Placa,
                                       StatusManutencao = m != null ? "Possui Histórico" : "Sem Manutenção",
                                       Descricao = m != null ? m.Descricao : "N/A",
                                       ValorGasto = m != null ? m.ValorGasto : 0
                                   }).ToListAsync();

            return Ok(resultado);
        }

        [HttpGet("gastos-manutencao-por-fabricante")]
        public async Task<IActionResult> GetGastosPorFabricante()
        {
            var resultado = await (from f in _context.Fabricantes
                                   join v in _context.Veiculos on f.Id equals v.FabricanteId
                                   join m in _context.Manutencoes on v.Id equals m.VeiculoId
                                   group m by f.Nome into grupo
                                   select new
                                   {
                                       Fabricante = grupo.Key,
                                       TotalGastoManutencao = grupo.Sum(x => x.ValorGasto),
                                       QtdManutencoes = grupo.Count()
                                   }).ToListAsync();

            return Ok(resultado);
        }
    }
}