namespace shms_notification_service.Settings;

public class SmtpSettings
{
    public string Host { get; set; } = "";
    public int Port { get; set; } = 587;
    public string Username { get; set; } = "";
    public string Password { get; set; } = "";
    public string FromName { get; set; } = "";
    public string FromEmail { get; set; } = "";
}

public class TwilioSettings
{
    public string AccountSid { get; set; } = "";
    public string AuthToken { get; set; } = "";
    public string FromPhone { get; set; } = "";
}