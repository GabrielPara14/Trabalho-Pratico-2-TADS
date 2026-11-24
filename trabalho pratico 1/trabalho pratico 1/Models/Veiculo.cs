using System.ComponentModel.DataAnnotations;

namespace trabalho_pratico_1.Models
{
    public class Veiculo
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "O modelo é obrigatório.")]
        public string Modelo { get; set; } = null!;

        [Range(1900, 2100, ErrorMessage = "Ano de fabricação inválido.")]
        public int AnoFabricacao { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "A quilometragem não pode ser negativa.")]
        public int Quilometragem { get; set; }

        [Required(ErrorMessage = "A placa é obrigatória.")]
        [StringLength(10, ErrorMessage = "A placa não pode exceder 10 caracteres.")]
        public string Placa { get; set; } = null!;

        [Required(ErrorMessage = "O FabricanteId é obrigatório.")]
        public int FabricanteId { get; set; }
        public Fabricante? Fabricante { get; set; }

        public ICollection<Aluguel> Alugueis { get; set; } = new List<Aluguel>();
        public ICollection<Manutencao> Manutencoes { get; set; } = new List<Manutencao>();
    }
}