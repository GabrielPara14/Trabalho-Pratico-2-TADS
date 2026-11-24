using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using trabalho_pratico_1.Data;
using trabalho_pratico_1.Models;

namespace trabalho_pratico_1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AlugueisController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AlugueisController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var alugueis = await _context.Alugueis
                .Include(a => a.Cliente)
                .Include(a => a.Veiculo)
                .ToListAsync();
            return Ok(alugueis);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var aluguel = await _context.Alugueis
                .Include(a => a.Cliente)
                .Include(a => a.Veiculo)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (aluguel == null) return NotFound("Aluguel não encontrado.");
            return Ok(aluguel);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Aluguel aluguel)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                _context.Alugueis.Add(aluguel);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetById), new { id = aluguel.Id }, aluguel);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao registrar aluguel: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Aluguel aluguel)
        {
            if (id != aluguel.Id) return BadRequest("IDs divergentes.");

            _context.Entry(aluguel).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Alugueis.Any(a => a.Id == id)) return NotFound();
                throw;
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var aluguel = await _context.Alugueis.FindAsync(id);
            if (aluguel == null) return NotFound("Aluguel não encontrado.");

            _context.Alugueis.Remove(aluguel);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}