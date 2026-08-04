using Microsoft.AspNetCore.Mvc;
using shms_notification_service.Models;
using shms_notification_service.Services;

namespace shms_notification_service.Controllers;

[ApiController]
[Route("api/notify")]
public class NotificationController : ControllerBase
{
    private readonly EmailService _email;
    private readonly SmsService _sms;
    private readonly ILogger<NotificationController>
        _logger;

    public NotificationController(
        EmailService email,
        SmsService sms,
        ILogger<NotificationController> logger)
    {
        _email = email;
        _sms = sms;
        _logger = logger;
    }

    // ── Health check ──────────────────────────────────────────────────
    [HttpGet("health")]
    public IActionResult Health()
        => Ok(new
        {
            status = "SHMS Notification Service Running",
            timestamp = DateTime.Now
        });

    // ── Send OTP ──────────────────────────────────────────────────────
    [HttpPost("otp")]
    public async Task<IActionResult> SendOtp(
        [FromBody] NotificationRequest req)
    {
        _logger.LogInformation(
            "OTP notification for: {Email}",
            req.RecipientEmail);

        var response = new NotificationResponse();

        // Send email OTP
        if (!string.IsNullOrEmpty(
                req.RecipientEmail))
        {
            string html = _email.GetOtpTemplate(
                req.RecipientName ?? "User",
                req.OtpCode ?? "000000",
                req.NotificationType ??
                    "Verification");

            bool sent = await _email.SendEmailAsync(
                req.RecipientEmail,
                req.RecipientName ?? "User",
                $"SHMS OTP: {req.OtpCode}",
                html);

            response.EmailStatus =
                sent ? "SENT" : "FAILED";
        }

        // Send SMS OTP if phone provided
        if (!string.IsNullOrEmpty(req.RecipientPhone))
        {
            string smsText = _sms.OtpMessage(
                req.OtpCode ?? "000000",
                req.NotificationType ?? "Login");

            bool sent = await _sms.SendSmsAsync(
                req.RecipientPhone, smsText);

            response.SmsStatus =
                sent ? "SENT" : "FAILED";
        }

        response.Success = true;
        response.Message =
            "OTP notification processed.";

        return Ok(response);
    }

    // ── Appointment confirmed ─────────────────────────────────────────
    [HttpPost("appointment")]
    public async Task<IActionResult>
        AppointmentConfirmed(
            [FromBody] NotificationRequest req)
    {
        _logger.LogInformation(
            "Appointment notification for: {Name}",
            req.RecipientName);

        var response = new NotificationResponse();

        if (!string.IsNullOrEmpty(
                req.RecipientEmail))
        {
            string html =
                _email.GetAppointmentTemplate(
                    req.RecipientName ?? "Patient",
                    req.DoctorName ?? "Doctor",
                    req.AppointmentDate ?? "",
                    req.AppointmentTime ?? "");

            bool sent = await _email.SendEmailAsync(
                req.RecipientEmail,
                req.RecipientName ?? "Patient",
                "Appointment Confirmed — SHMS Hospital",
                html);

            response.EmailStatus =
                sent ? "SENT" : "FAILED";
        }

        if (!string.IsNullOrEmpty(req.RecipientPhone))
        {
            string smsText =
                _sms.AppointmentMessage(
                    req.DoctorName ?? "Doctor",
                    req.AppointmentDate ?? "",
                    req.AppointmentTime ?? "");

            bool sent = await _sms.SendSmsAsync(
                req.RecipientPhone, smsText);

            response.SmsStatus =
                sent ? "SENT" : "FAILED";
        }

        response.Success = true;
        response.Message =
            "Appointment notification sent.";

        return Ok(response);
    }

    // ── Lab report ready ──────────────────────────────────────────────
    [HttpPost("lab-report")]
    public async Task<IActionResult> LabReportReady(
        [FromBody] NotificationRequest req)
    {
        _logger.LogInformation(
            "Lab report notification for: {Name}",
            req.RecipientName);

        var response = new NotificationResponse();

        if (!string.IsNullOrEmpty(
                req.RecipientEmail))
        {
            string html = _email.GetLabReportTemplate(
                req.RecipientName ?? "Patient",
                req.Subject ?? "Lab Test");

            bool sent = await _email.SendEmailAsync(
                req.RecipientEmail,
                req.RecipientName ?? "Patient",
                "Lab Report Ready — SHMS Hospital",
                html);

            response.EmailStatus =
                sent ? "SENT" : "FAILED";
        }

        if (!string.IsNullOrEmpty(req.RecipientPhone))
        {
            string smsText = _sms.LabReportMessage(
                req.Subject ?? "Lab Test");

            bool sent = await _sms.SendSmsAsync(
                req.RecipientPhone, smsText);

            response.SmsStatus =
                sent ? "SENT" : "FAILED";
        }

        response.Success = true;
        response.Message =
            "Lab report notification sent.";

        return Ok(response);
    }

    // ── Prescription issued ───────────────────────────────────────────
    [HttpPost("prescription")]
    public async Task<IActionResult>
        PrescriptionIssued(
            [FromBody] NotificationRequest req)
    {
        _logger.LogInformation(
            "Prescription notification for: {Name}",
            req.RecipientName);

        var response = new NotificationResponse();

        if (!string.IsNullOrEmpty(
                req.RecipientEmail))
        {
            string html =
                _email.GetPrescriptionTemplate(
                    req.RecipientName ?? "Patient",
                    req.DoctorName ?? "Doctor");

            bool sent = await _email.SendEmailAsync(
                req.RecipientEmail,
                req.RecipientName ?? "Patient",
                "Prescription Issued — SHMS Hospital",
                html);

            response.EmailStatus =
                sent ? "SENT" : "FAILED";
        }

        response.Success = true;
        response.Message =
            "Prescription notification sent.";

        return Ok(response);
    }

    // ── Password reset OTP ────────────────────────────────────────────
    [HttpPost("password-reset")]
    public async Task<IActionResult> PasswordReset(
        [FromBody] NotificationRequest req)
    {
        _logger.LogInformation(
            "Password reset OTP for: {Email}",
            req.RecipientEmail);

        var response = new NotificationResponse();

        if (!string.IsNullOrEmpty(
                req.RecipientEmail))
        {
            string html =
                _email.GetPasswordResetTemplate(
                    req.RecipientName ?? "User",
                    req.OtpCode ?? "000000");

            bool sent = await _email.SendEmailAsync(
                req.RecipientEmail,
                req.RecipientName ?? "User",
                "Password Reset OTP — SHMS Hospital",
                html);

            response.EmailStatus =
                sent ? "SENT" : "FAILED";
        }

        response.Success = true;
        response.Message =
            "Password reset OTP sent.";

        return Ok(response);
    }

    // ── Discharge summary ─────────────────────────────────────────────
    [HttpPost("discharge")]
    public async Task<IActionResult>
        DischargeSummary(
            [FromBody] NotificationRequest req)
    {
        _logger.LogInformation(
            "Discharge notification for: {Name}",
            req.RecipientName);

        var response = new NotificationResponse();

        if (!string.IsNullOrEmpty(
                req.RecipientEmail))
        {
            string html = _email.GetDischargeTemplate(
                req.RecipientName ?? "Patient",
                req.Message ?? "Please follow up.");

            bool sent = await _email.SendEmailAsync(
                req.RecipientEmail,
                req.RecipientName ?? "Patient",
                "Discharge Summary — SHMS Hospital",
                html);

            response.EmailStatus =
                sent ? "SENT" : "FAILED";
        }

        if (!string.IsNullOrEmpty(req.RecipientPhone))
        {
            bool sent = await _sms.SendSmsAsync(
                req.RecipientPhone,
                _sms.DischargeMessage(
                    req.RecipientName ?? "Patient"));

            response.SmsStatus =
                sent ? "SENT" : "FAILED";
        }

        response.Success = true;
        response.Message =
            "Discharge notification sent.";

        return Ok(response);
    }

    // ── Insurance claim update ────────────────────────────────────────
    [HttpPost("insurance")]
    public async Task<IActionResult>
        InsuranceUpdate(
            [FromBody] NotificationRequest req)
    {
        _logger.LogInformation(
            "Insurance notification for: {Name}",
            req.RecipientName);

        var response = new NotificationResponse();

        if (!string.IsNullOrEmpty(
                req.RecipientEmail))
        {
            string html = $"""
            <div style="font-family: Arial;
                max-width: 600px; margin: 0 auto;
                padding: 20px;">
                <h2 style="color: #0d6efd;">
                    🛡️ Insurance Claim Update
                </h2>
                <p>Hello {req.RecipientName},</p>
                <p>{req.Message}</p>
                <p>Login to SHMS portal for details.
                </p>
                <p style="color: #999;
                    font-size: 12px;">
                    SHMS Hospital
                </p>
            </div>
            """;

            bool sent = await _email.SendEmailAsync(
                req.RecipientEmail,
                req.RecipientName ?? "Patient",
                "Insurance Claim Update — SHMS",
                html);

            response.EmailStatus =
                sent ? "SENT" : "FAILED";
        }

        response.Success = true;
        response.Message =
            "Insurance notification sent.";

        return Ok(response);
    }
}