using System.ComponentModel.DataAnnotations;

namespace trabalho_pratico_1.Models
{
    public class Fabricante
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "O nome do fabricante é obrigatório.")]
        [StringLength(50, ErrorMessage = "O nome não pode exceder 50 caracteres.")]
        public string Nome { get; set; } = null!;

        public ICollection<Veiculo> Veiculos { get; set; } = new List<Veiculo>();
    }
}