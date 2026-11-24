using Microsoft.EntityFrameworkCore;
using trabalho_pratico_1.Data;

namespace trabalho_pratico_1
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(@"Server=.\SQLEXPRESS;Database=LocadoraDb;Trusted_Connection=True;TrustServerCertificate=True;"));
            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                    {
                        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
                    });
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            // TP2: libera o front-end (outra origem) para chamar a API via fetch
            builder.Services.AddCors(options =>
                options.AddPolicy("FrontEnd", policy =>
                    policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));
            var app = builder.Build();
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }
            app.UseHttpsRedirection();
            app.UseCors("FrontEnd");
            app.UseAuthorization();
            app.MapControllers();
            app.Run();
        }
    }
}