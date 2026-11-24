using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using trabalho_pratico_1.Data;
using trabalho_pratico_1.Models;

namespace trabalho_pratico_1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VeiculosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VeiculosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var veiculos = await _context.Veiculos.Include(v => v.Fabricante).ToListAsync();
            return Ok(veiculos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var veiculo = await _context.Veiculos.Include(v => v.Fabricante).FirstOrDefaultAsync(v => v.Id == id);
            if (veiculo == null) return NotFound("Veículo não encontrado.");
            return Ok(veiculo);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Veiculo veiculo)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                _context.Veiculos.Add(veiculo);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetById), new { id = veiculo.Id }, veiculo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao cadastrar veículo: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Veiculo veiculo)
        {
            if (id != veiculo.Id) return BadRequest("IDs divergentes.");

            _context.Entry(veiculo).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Veiculos.Any(v => v.Id == id)) return NotFound();
                throw;
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var veiculo = await _context.Veiculos.FindAsync(id);
            if (veiculo == null) return NotFound("Veículo não encontrado.");

            _context.Veiculos.Remove(veiculo);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}