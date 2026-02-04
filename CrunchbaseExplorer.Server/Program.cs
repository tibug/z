using CrunchbaseExplorer.Server.Infrastructure.Database;
using CrunchbaseExplorer.Server.Repositories;
using CrunchbaseExplorer.Server.Services;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Crunchbase Explorer API",
        Version = "v1",
        Description = "High-performance API for Crunchbase-style B2B data exploration"
    });
});

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

// Register infrastructure services
builder.Services.AddSingleton<IDbConnectionFactory, SqlConnectionFactory>();

// Register repositories
builder.Services.AddScoped<IOrganizationRepository, OrganizationRepository>();
builder.Services.AddScoped<IPersonRepository, PersonRepository>();
builder.Services.AddScoped<IFundingRoundRepository, FundingRoundRepository>();
builder.Services.AddScoped<IInvestmentRepository, InvestmentRepository>();
builder.Services.AddScoped<IAcquisitionRepository, AcquisitionRepository>();
builder.Services.AddScoped<IEventRepository, EventRepository>();
builder.Services.AddScoped<IGlobalSearchRepository, GlobalSearchRepository>();

// Register services
builder.Services.AddScoped<IOrganizationService, OrganizationService>();
builder.Services.AddScoped<IPersonService, PersonService>();
builder.Services.AddScoped<IFundingRoundService, FundingRoundService>();
builder.Services.AddScoped<IInvestmentService, InvestmentService>();
builder.Services.AddScoped<IAcquisitionService, AcquisitionService>();
builder.Services.AddScoped<IEventService, EventService>();
builder.Services.AddScoped<IGlobalSearchService, GlobalSearchService>();

// Add health checks
builder.Services.AddHealthChecks();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");

// Enable static files for wwwroot (default)
app.UseStaticFiles();

// Enable static files for /app path - MUST come before the fallback route
var appPath = Path.Combine(app.Environment.WebRootPath, "app");
if (Directory.Exists(appPath))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        RequestPath = "/app",
        FileProvider = new PhysicalFileProvider(appPath)
    });
}

app.UseAuthorization();

// API routes
app.MapControllers();
app.MapHealthChecks("/health");

// App route - serve index.html for the root /app path
app.MapGet("/app", async context =>
{
    var filePath = Path.Combine(app.Environment.WebRootPath, "app", "index.html");
    if (File.Exists(filePath))
    {
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync(filePath);
    }
    else
    {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsync($"App file not found at: {filePath}");
    }
});

// Organization detail page route
app.MapGet("/app/organization/{*slug}", async context =>
{
    var filePath = Path.Combine(app.Environment.WebRootPath, "app", "organization.html");
    if (File.Exists(filePath))
    {
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync(filePath);
    }
    else
    {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsync("Organization page not found");
    }
});

// Person detail page route
app.MapGet("/app/person/{*slug}", async context =>
{
    var filePath = Path.Combine(app.Environment.WebRootPath, "app", "person.html");
    if (File.Exists(filePath))
    {
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync(filePath);
    }
    else
    {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsync("Person page not found");
    }
});

// Funding round detail page route
app.MapGet("/app/funding/{*slug}", async context =>
{
    var filePath = Path.Combine(app.Environment.WebRootPath, "app", "funding.html");
    if (File.Exists(filePath))
    {
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync(filePath);
    }
    else
    {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsync("Funding page not found");
    }
});

// Event detail page route
app.MapGet("/app/event/{*slug}", async context =>
{
    var filePath = Path.Combine(app.Environment.WebRootPath, "app", "event.html");
    if (File.Exists(filePath))
    {
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync(filePath);
    }
    else
    {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsync("Event page not found");
    }
});

// App catch-all for client-side routing - only for non-file routes
app.MapFallbackToFile("/app/{**path:nonfile}", "app/index.html");

// Root redirects to app
app.MapGet("/", () => Results.Redirect("/app"));

app.Run();
