using shms_notification_service.Services;
using shms_notification_service.Settings;

var builder = WebApplication.CreateBuilder(args);

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

// ── CORS — allow Spring Boot to call this ─────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:8080",
                "http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors();
app.MapControllers();

app.Run();