using System.ComponentModel.DataAnnotations;

namespace trabalho_pratico_1.Models
{
    public class Aluguel
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "O ClienteId é obrigatório.")]
        public int ClienteId { get; set; }
        public Cliente? Cliente { get; set; }

        [Required(ErrorMessage = "O VeiculoId é obrigatório.")]
        public int VeiculoId { get; set; }
        public Veiculo? Veiculo { get; set; }

        [Required(ErrorMessage = "A data de início é obrigatória.")]
        public DateTime DataInicio { get; set; }

        [Required(ErrorMessage = "A data fim prevista é obrigatória.")]
        public DateTime DataFimPrevista { get; set; }

        public DateTime? DataDevolucao { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Quilometragem inicial inválida.")]
        public int QuilometragemInicial { get; set; }

        public int? QuilometragemFinal { get; set; }

        [Range(0.01, 10000.00, ErrorMessage = "Valor da diária inválido.")]
        public decimal ValorDiaria { get; set; }

        public decimal? ValorTotal { get; set; }
    }
}