using System.ComponentModel.DataAnnotations;

namespace trabalho_pratico_1.Models
{
    public class Cliente
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "O nome do cliente é obrigatório.")]
        [StringLength(100, ErrorMessage = "O nome não pode exceder 100 caracteres.")]
        public string Nome { get; set; } = null!;

        [Required(ErrorMessage = "O CPF é obrigatório.")]
        [StringLength(14, ErrorMessage = "O CPF deve ter no máximo 14 caracteres.")]
        public string CPF { get; set; } = null!;

        [Required(ErrorMessage = "O e-mail é obrigatório.")]
        [EmailAddress(ErrorMessage = "E-mail em formato inválido.")]
        public string Email { get; set; } = null!;

        public ICollection<Aluguel> Alugueis { get; set; } = new List<Aluguel>();
    }
}