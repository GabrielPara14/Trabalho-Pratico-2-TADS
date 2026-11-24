using Microsoft.EntityFrameworkCore;
using trabalho_pratico_1.Models;

namespace trabalho_pratico_1.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext() { }
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<Fabricante> Fabricantes { get; set; } = null!;
        public DbSet<Veiculo> Veiculos { get; set; } = null!;
        public DbSet<Cliente> Clientes { get; set; } = null!;
        public DbSet<Aluguel> Alugueis { get; set; } = null!;
        public DbSet<Manutencao> Manutencoes { get; set; } = null!;
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlServer(@"Server=.\SQLEXPRESS;Database=LocadoraDb;Trusted_Connection=True;TrustServerCertificate=True;");
            }
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Cliente>()
                .HasIndex(c => c.CPF).IsUnique();
            modelBuilder.Entity<Aluguel>()
                .Property(a => a.ValorDiaria).HasPrecision(18, 2);
            modelBuilder.Entity<Aluguel>()
                .Property(a => a.ValorTotal).HasPrecision(18, 2);
            modelBuilder.Entity<Manutencao>()
                .Property(m => m.ValorGasto).HasPrecision(18, 2);
            base.OnModelCreating(modelBuilder);
        }
    }
}