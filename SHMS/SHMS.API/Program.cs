using shms_notification_service.Services;
using shms_notification_service.Settings;

var builder = WebApplication.CreateBuilder(args);

// ── Bind to Render's dynamic PORT on 0.0.0.0 (not localhost) ──────────
// Render assigns a PORT env var; ASPNETCORE_URLS must use http://+:PORT
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// ── Read settings ─────────────────────────────────────────────────────
var smtpSettings = new SmtpSettings();
builder.Configuration.GetSection("Smtp")
    .Bind(smtpSettings);

var twilioSettings = new TwilioSettings();
builder.Configuration.GetSection("Twilio")
    .Bind(twilioSettings);

// ── Register services ─────────────────────────────────────────────────
builder.Services.AddSingleton(smtpSettings);
builder.Services.AddSingleton(twilioSettings);
builder.Services.AddSingleton<EmailService>();
builder.Services.AddSingleton<SmsService>();

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors();
app.MapControllers();

app.Run();