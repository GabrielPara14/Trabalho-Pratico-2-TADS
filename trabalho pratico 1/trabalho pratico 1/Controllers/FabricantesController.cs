using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using trabalho_pratico_1.Data;
using trabalho_pratico_1.Models;

namespace trabalho_pratico_1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FabricantesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FabricantesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var fabricantes = await _context.Fabricantes.ToListAsync();
            return Ok(fabricantes);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var fabricante = await _context.Fabricantes.FindAsync(id);
            if (fabricante == null) return NotFound("Fabricante não encontrado.");
            return Ok(fabricante);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Fabricante fabricante)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                _context.Fabricantes.Add(fabricante);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetById), new { id = fabricante.Id }, fabricante);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno ao salvar fabricante: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Fabricante fabricante)
        {
            if (id != fabricante.Id) return BadRequest("IDs divergentes.");

            _context.Entry(fabricante).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Fabricantes.Any(f => f.Id == id)) return NotFound("Fabricante não encontrado.");
                throw;
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var fabricante = await _context.Fabricantes.FindAsync(id);
            if (fabricante == null) return NotFound("Fabricante não encontrado.");

            _context.Fabricantes.Remove(fabricante);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}