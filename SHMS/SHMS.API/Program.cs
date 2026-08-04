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