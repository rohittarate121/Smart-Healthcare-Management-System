using Twilio;
using Twilio.Rest.Api.V2010.Account;
using shms_notification_service.Settings;

namespace shms_notification_service.Services;

public class SmsService
{
    private readonly TwilioSettings _twilio;
    private readonly ILogger<SmsService> _logger;

    public SmsService(
        TwilioSettings twilio,
        ILogger<SmsService> logger)
    {
        _twilio = twilio;
        _logger = logger;

        // Initialize Twilio client
        TwilioClient.Init(
            _twilio.AccountSid,
            _twilio.AuthToken);
    }

    public async Task<bool> SendSmsAsync(
        string toPhone, string message)
    {
        try
        {
            // Format phone number
            // Add country code if not present
            string formatted = toPhone;
            if (!toPhone.StartsWith("+"))
            {
                // Assuming India (+91)
                formatted = "+91" + toPhone;
            }

            var smsMessage =
                await MessageResource.CreateAsync(
                    body: message,
                    from: new Twilio.Types.PhoneNumber(
                        _twilio.FromPhone),
                    to: new Twilio.Types.PhoneNumber(
                        formatted));

            _logger.LogInformation(
                "SMS sent to {Phone} | SID: {Sid}",
                toPhone, smsMessage.Sid);

            return smsMessage.ErrorCode == null;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                "SMS failed to {Phone}: {Error}",
                toPhone, ex.Message);
            return false;
        }
    }

    // ── SMS Templates (short messages) ───────────────────────────────

    public string OtpMessage(
        string otp, string purpose)
        => $"SHMS Hospital: Your OTP for {purpose}" +
           $" is {otp}. Valid for 10 minutes. " +
           $"Do not share with anyone.";

    public string AppointmentMessage(
        string doctorName, string date, string time)
        => $"SHMS: Appointment confirmed with " +
           $"Dr. {doctorName} on {date} at {time}. " +
           $"Arrive 10 mins early.";

    public string LabReportMessage(string testName)
        => $"SHMS: Your lab report for {testName}" +
           $" is ready. Login to view it.";

    public string DischargeMessage(string name)
        => $"SHMS: Dear {name}, you have been " +
           $"successfully discharged. " +
           $"Get well soon!";
}