using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using shms_notification_service.Settings;

namespace shms_notification_service.Services;

public class EmailService
{
    private readonly SmtpSettings _smtp;
    private readonly ILogger<EmailService> _logger;

    public EmailService(
        SmtpSettings smtp,
        ILogger<EmailService> logger)
    {
        _smtp = smtp;
        _logger = logger;
    }

    public async Task<bool> SendEmailAsync(
        string toEmail,
        string toName,
        string subject,
        string htmlBody)
    {
        try
        {
            var message = new MimeMessage();

            message.From.Add(new MailboxAddress(
                _smtp.FromName,
                _smtp.FromEmail));

            message.To.Add(new MailboxAddress(
                toName, toEmail));

            message.Subject = subject;

            var builder = new BodyBuilder
            {
                HtmlBody = htmlBody
            };

            message.Body = builder.ToMessageBody();

            using var client = new SmtpClient();

            await client.ConnectAsync(
                _smtp.Host,
                _smtp.Port,
                SecureSocketOptions.StartTls);

            await client.AuthenticateAsync(
                _smtp.Username,
                _smtp.Password);

            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation(
                "Email sent to {Email} | Subject: {Subject}",
                toEmail, subject);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                "Email failed to {Email}: {Error}",
                toEmail, ex.Message);
            return false;
        }
    }

    // ── Email Templates ───────────────────────────────────────────────

    public string GetOtpTemplate(
        string name, string otp, string purpose)
    {
        return $"""
        <div style="font-family: Arial, sans-serif;
            max-width: 600px; margin: 0 auto;
            padding: 20px;">
            <div style="background: #0d6efd;
                padding: 20px; text-align: center;
                border-radius: 8px 8px 0 0;">
                <h2 style="color: white; margin: 0;">
                    🏥 SHMS Hospital
                </h2>
            </div>
            <div style="background: #f8f9fa;
                padding: 30px;
                border-radius: 0 0 8px 8px;">
                <h3>Hello, {name}!</h3>
                <p>Your OTP for <strong>{purpose}</strong> is:</p>
                <div style="background: #0d6efd;
                    color: white; font-size: 32px;
                    font-weight: bold;
                    text-align: center;
                    padding: 20px; border-radius: 8px;
                    letter-spacing: 8px; margin: 20px 0;">
                    {otp}
                </div>
                <p style="color: #666;">
                    This OTP is valid for
                    <strong>10 minutes</strong>.
                    Do not share it with anyone.
                </p>
                <hr />
                <p style="color: #999; font-size: 12px;">
                    Smart Healthcare Management System
                </p>
            </div>
        </div>
        """;
    }

    public string GetAppointmentTemplate(
        string patientName,
        string doctorName,
        string date,
        string time)
    {
        return $"""
        <div style="font-family: Arial, sans-serif;
            max-width: 600px; margin: 0 auto;
            padding: 20px;">
            <div style="background: #0d6efd;
                padding: 20px; text-align: center;
                border-radius: 8px 8px 0 0;">
                <h2 style="color: white; margin: 0;">
                    🏥 Appointment Confirmed
                </h2>
            </div>
            <div style="background: #f8f9fa;
                padding: 30px;
                border-radius: 0 0 8px 8px;">
                <h3>Hello, {patientName}!</h3>
                <p>Your appointment has been
                    confirmed.</p>
                <table style="width: 100%;
                    border-collapse: collapse;">
                    <tr style="background: #e7f1ff;">
                        <td style="padding: 10px;
                            font-weight: bold;">
                            Doctor
                        </td>
                        <td style="padding: 10px;">
                            Dr. {doctorName}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px;
                            font-weight: bold;">
                            Date
                        </td>
                        <td style="padding: 10px;">
                            {date}
                        </td>
                    </tr>
                    <tr style="background: #e7f1ff;">
                        <td style="padding: 10px;
                            font-weight: bold;">
                            Time
                        </td>
                        <td style="padding: 10px;">
                            {time}
                        </td>
                    </tr>
                </table>
                <p style="margin-top: 20px;
                    color: #666;">
                    Please arrive 10 minutes early
                    and bring your ID.
                </p>
                <hr />
                <p style="color: #999;
                    font-size: 12px;">
                    SHMS Hospital
                </p>
            </div>
        </div>
        """;
    }

    public string GetLabReportTemplate(
        string patientName, string testName)
    {
        return $"""
        <div style="font-family: Arial, sans-serif;
            max-width: 600px; margin: 0 auto;
            padding: 20px;">
            <div style="background: #198754;
                padding: 20px; text-align: center;
                border-radius: 8px 8px 0 0;">
                <h2 style="color: white; margin: 0;">
                    🔬 Lab Report Ready
                </h2>
            </div>
            <div style="background: #f8f9fa;
                padding: 30px;
                border-radius: 0 0 8px 8px;">
                <h3>Hello, {patientName}!</h3>
                <p>Your lab report for
                    <strong>{testName}</strong>
                    is now ready.</p>
                <p>Login to SHMS portal to view
                    and download your report.</p>
                <div style="text-align: center;
                    margin: 20px 0;">
                    <a href="http://localhost:3000/patient/lab-reports"
                        style="background: #198754;
                        color: white; padding: 12px 24px;
                        border-radius: 6px;
                        text-decoration: none;
                        font-weight: bold;">
                        View Report
                    </a>
                </div>
                <hr />
                <p style="color: #999;
                    font-size: 12px;">
                    SHMS Hospital
                </p>
            </div>
        </div>
        """;
    }

    public string GetPrescriptionTemplate(
        string patientName, string doctorName)
    {
        return $"""
        <div style="font-family: Arial, sans-serif;
            max-width: 600px; margin: 0 auto;
            padding: 20px;">
            <div style="background: #6f42c1;
                padding: 20px; text-align: center;
                border-radius: 8px 8px 0 0;">
                <h2 style="color: white; margin: 0;">
                    💊 Prescription Issued
                </h2>
            </div>
            <div style="background: #f8f9fa;
                padding: 30px;
                border-radius: 0 0 8px 8px;">
                <h3>Hello, {patientName}!</h3>
                <p>Dr. <strong>{doctorName}</strong>
                    has issued a prescription
                    for you.</p>
                <p>Login to the SHMS portal to
                    view your prescription and
                    medicine details.</p>
                <div style="text-align: center;
                    margin: 20px 0;">
                    <a href="http://localhost:3000/patient/prescriptions"
                        style="background: #6f42c1;
                        color: white; padding: 12px 24px;
                        border-radius: 6px;
                        text-decoration: none;
                        font-weight: bold;">
                        View Prescription
                    </a>
                </div>
                <hr />
                <p style="color: #999;
                    font-size: 12px;">
                    SHMS Hospital
                </p>
            </div>
        </div>
        """;
    }

    public string GetPasswordResetTemplate(
        string name, string otp)
    {
        return $"""
        <div style="font-family: Arial, sans-serif;
            max-width: 600px; margin: 0 auto;
            padding: 20px;">
            <div style="background: #dc3545;
                padding: 20px; text-align: center;
                border-radius: 8px 8px 0 0;">
                <h2 style="color: white; margin: 0;">
                    🔐 Password Reset Request
                </h2>
            </div>
            <div style="background: #f8f9fa;
                padding: 30px;
                border-radius: 0 0 8px 8px;">
                <h3>Hello, {name}!</h3>
                <p>We received a request to reset
                    your SHMS account password.</p>
                <p>Your password reset OTP is:</p>
                <div style="background: #dc3545;
                    color: white; font-size: 32px;
                    font-weight: bold;
                    text-align: center;
                    padding: 20px; border-radius: 8px;
                    letter-spacing: 8px;
                    margin: 20px 0;">
                    {otp}
                </div>
                <p style="color: #666;">
                    This OTP expires in
                    <strong>10 minutes</strong>.
                    If you did not request this,
                    ignore this email.
                </p>
                <hr />
                <p style="color: #999;
                    font-size: 12px;">
                    SHMS Hospital
                </p>
            </div>
        </div>
        """;
    }

    public string GetDischargeTemplate(
        string patientName, string summary)
    {
        return $"""
        <div style="font-family: Arial, sans-serif;
            max-width: 600px; margin: 0 auto;
            padding: 20px;">
            <div style="background: #0d6efd;
                padding: 20px; text-align: center;
                border-radius: 8px 8px 0 0;">
                <h2 style="color: white; margin: 0;">
                    🏥 Discharge Summary
                </h2>
            </div>
            <div style="background: #f8f9fa;
                padding: 30px;
                border-radius: 0 0 8px 8px;">
                <h3>Hello, {patientName}!</h3>
                <p>You have been successfully
                    discharged from SHMS Hospital.</p>
                <div style="background: white;
                    padding: 15px; border-radius: 6px;
                    border-left: 4px solid #0d6efd;
                    margin: 15px 0;">
                    <strong>Discharge Notes:</strong>
                    <p>{summary}</p>
                </div>
                <p>Please follow all prescribed
                    medications and attend follow-up
                    appointments as advised.</p>
                <hr />
                <p style="color: #999;
                    font-size: 12px;">
                    SHMS Hospital — Get well soon!
                </p>
            </div>
        </div>
        """;
    }
}