namespace trabalho_pratico_1.Models
{
    public class Manutencao
    {
        public int Id { get; set; }
        public DateTime DataManutencao { get; set; }
        public string Descricao { get; set; } = null!;
        public decimal ValorGasto { get; set; }
        public int QuilometragemNaManutencao { get; set; }
        public int VeiculoId { get; set; }
        public Veiculo? Veiculo { get; set; }
    }
}