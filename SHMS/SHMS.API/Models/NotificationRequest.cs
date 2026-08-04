namespace shms_notification_service.Models;

public class NotificationRequest
{
    public string? RecipientName { get; set; }
    public string? RecipientEmail { get; set; }
    public string? RecipientPhone { get; set; }
    public string? Subject { get; set; }
    public string? Message { get; set; }
    public string? NotificationType { get; set; }

    // EMAIL, SMS, BOTH, IN_APP
    public string Channel { get; set; } = "EMAIL";

    // Additional data for specific notification types
    public string? OtpCode { get; set; }
    public string? AppointmentDate { get; set; }
    public string? AppointmentTime { get; set; }
    public string? DoctorName { get; set; }
    public string? PatientName { get; set; }
    public string? Amount { get; set; }
}

public class NotificationResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = "";
    public string? EmailStatus { get; set; }
    public string? SmsStatus { get; set; }
}