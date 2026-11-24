using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using trabalho_pratico_1.Data;
using trabalho_pratico_1.Models;

namespace trabalho_pratico_1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClientesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ClientesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _context.Clientes.ToListAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var cliente = await _context.Clientes.FindAsync(id);
            if (cliente == null) return NotFound("Cliente não encontrado.");
            return Ok(cliente);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Cliente cliente)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                _context.Clientes.Add(cliente);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetById), new { id = cliente.Id }, cliente);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao criar cliente: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Cliente cliente)
        {
            if (id != cliente.Id) return BadRequest("IDs divergentes.");

            _context.Entry(cliente).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Clientes.Any(c => c.Id == id)) return NotFound();
                throw;
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var cliente = await _context.Clientes.FindAsync(id);
            if (cliente == null) return NotFound("Cliente não encontrado.");

            _context.Clientes.Remove(cliente);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}