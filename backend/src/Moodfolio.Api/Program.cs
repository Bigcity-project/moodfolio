using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.EntityFrameworkCore;
using Moodfolio.Application.DoNothingSimulation.Services;
using Moodfolio.Application.MarketWeather.Services;
using Moodfolio.Application.PortfolioPersona.Services;
using Moodfolio.Contracts.Validators;
using Moodfolio.Infrastructure;
using Moodfolio.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Moodfolio API", Version = "v1" });
});

builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(Moodfolio.Application.MarketWeather.Queries.GetMarketWeatherQuery).Assembly);
});

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<TransactionDtoValidator>();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Data Source=moodfolio.db";
builder.Services.AddInfrastructure(connectionString);

builder.Services.AddScoped<IMoodScoreCalculator, MoodScoreCalculator>();
builder.Services.AddScoped<IWeatherClassifier, WeatherClassifier>();
builder.Services.AddScoped<ITrendAnalyzer, TrendAnalyzer>();

builder.Services.AddScoped<IPortfolioCalculator, PortfolioCalculator>();
builder.Services.AddScoped<IBenchmarkSimulator, BenchmarkSimulator>();
builder.Services.AddScoped<IVerdictGenerator, VerdictGenerator>();

builder.Services.AddScoped<IHoldingPeriodCalculator, HoldingPeriodCalculator>();
builder.Services.AddScoped<ITurnoverRateCalculator, TurnoverRateCalculator>();
builder.Services.AddScoped<IPanicSellRatioCalculator, PanicSellRatioCalculator>();
builder.Services.AddScoped<IWinRateCalculator, WinRateCalculator>();
builder.Services.AddScoped<IPersonaClassifier, PersonaClassifier>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<MoodfolioDbContext>();
    dbContext.Database.EnsureCreated();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Moodfolio API v1");
    });
}

app.UseCors("AllowFrontend");
app.MapControllers();

app.Run();

public partial class Program { }
