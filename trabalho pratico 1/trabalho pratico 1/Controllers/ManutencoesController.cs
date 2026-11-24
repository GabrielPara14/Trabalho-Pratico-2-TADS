using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using trabalho_pratico_1.Data;
using trabalho_pratico_1.Models;

namespace trabalho_pratico_1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ManutencoesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ManutencoesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var manutencoes = await _context.Manutencoes.Include(m => m.Veiculo).ToListAsync();
            return Ok(manutencoes);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var manutencao = await _context.Manutencoes.Include(m => m.Veiculo).FirstOrDefaultAsync(m => m.Id == id);
            if (manutencao == null) return NotFound("Manutenção não encontrada.");
            return Ok(manutencao);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Manutencao manutencao)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                _context.Manutencoes.Add(manutencao);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetById), new { id = manutencao.Id }, manutencao);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao registrar manutenção: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Manutencao manutencao)
        {
            if (id != manutencao.Id) return BadRequest("IDs divergentes.");

            _context.Entry(manutencao).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Manutencoes.Any(m => m.Id == id)) return NotFound("Manutenção não encontrada.");
                throw;
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var manutencao = await _context.Manutencoes.FindAsync(id);
            if (manutencao == null) return NotFound("Manutenção não encontrada.");

            _context.Manutencoes.Remove(manutencao);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}