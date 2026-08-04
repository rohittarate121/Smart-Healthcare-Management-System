package com.shms.util;

import com.shms.model.User;
import com.shms.model.Appointment;
import com.shms.model.LabReport;
import com.shms.model.Prescription;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component
public class NotificationClient {

    @Value("${app.notification.url}")
    private String notificationUrl;

    private final RestTemplate restTemplate =
            new RestTemplate();

    // ── Generic send method ───────────────────────────────────────────
    private void send(
            String endpoint,
            Map<String, Object> payload) {
        try {
            restTemplate.postForObject(
                notificationUrl + endpoint,
                payload,
                String.class);

            System.out.println(
                "Notification sent: " + endpoint);

        } catch (Exception ex) {
            // Graceful degradation
            // Notification failure never breaks
            // the main operation
            System.out.println(
                "Notification failed (non-critical): "
                + endpoint + " | " + ex.getMessage());
        }
    }

    // ── Send registration OTP ─────────────────────────────────────────
    public void sendRegistrationOtp(
            User user, String otp) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("recipientName", user.getName());
        payload.put("recipientEmail", user.getEmail());
        payload.put("recipientPhone", user.getPhone());
        payload.put("otpCode", otp);
        payload.put("notificationType",
                "Email Verification");
        payload.put("channel", "BOTH");

        send("/otp", payload);
    }

    // ── Send login OTP ────────────────────────────────────────────────
    public void sendLoginOtp(User user, String otp) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("recipientName", user.getName());
        payload.put("recipientEmail", user.getEmail());
        payload.put("recipientPhone", user.getPhone());
        payload.put("otpCode", otp);
        payload.put("notificationType", "Login");
        payload.put("channel", "BOTH");

        send("/otp", payload);
    }

    // ── Send password reset OTP ───────────────────────────────────────
    public void sendPasswordResetOtp(
            User user, String otp) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("recipientName", user.getName());
        payload.put("recipientEmail", user.getEmail());
        payload.put("otpCode", otp);
        payload.put("channel", "EMAIL");

        send("/password-reset", payload);
    }

    // ── Send appointment confirmation ─────────────────────────────────
    public void sendAppointmentConfirmation(
            Appointment appt) {
        try {
            Map<String, Object> payload =
                    new HashMap<>();
            payload.put("recipientName",
                appt.getPatient().getUser().getName());
            payload.put("recipientEmail",
                appt.getPatient().getUser().getEmail());
            payload.put("recipientPhone",
                appt.getPatient().getUser().getPhone());
            payload.put("doctorName",
                appt.getDoctor().getUser().getName());
            payload.put("appointmentDate",
                appt.getSlot() != null
                    ? appt.getSlot().getSlotDate()
                        .toString()
                    : "");
            payload.put("appointmentTime",
                appt.getSlot() != null
                    ? appt.getSlot().getStartTime()
                        .toString()
                    : "");

            send("/appointment", payload);
        } catch (Exception ex) {
            System.out.println(
                "Appointment notification " +
                "failed: " + ex.getMessage());
        }
    }

    // ── Send lab report ready notification ────────────────────────────
    public void sendLabReportReady(LabReport report) {
        try {
            Map<String, Object> payload =
                    new HashMap<>();
            payload.put("recipientName",
                report.getPatient()
                    .getUser().getName());
            payload.put("recipientEmail",
                report.getPatient()
                    .getUser().getEmail());
            payload.put("recipientPhone",
                report.getPatient()
                    .getUser().getPhone());
            payload.put("subject",
                report.getTestName());

            send("/lab-report", payload);
        } catch (Exception ex) {
            System.out.println(
                "Lab notification failed: "
                + ex.getMessage());
        }
    }

    // ── Send prescription notification ────────────────────────────────
    public void sendPrescriptionIssued(
            Prescription prescription) {
        try {
            Map<String, Object> payload =
                    new HashMap<>();
            payload.put("recipientName",
                prescription.getPatient()
                    .getUser().getName());
            payload.put("recipientEmail",
                prescription.getPatient()
                    .getUser().getEmail());
            payload.put("doctorName",
                prescription.getDoctor()
                    .getUser().getName());

            send("/prescription", payload);
        } catch (Exception ex) {
            System.out.println(
                "Prescription notification " +
                "failed: " + ex.getMessage());
        }
    }

    // ── Send discharge notification ───────────────────────────────────
    public void sendDischargeNotification(
            com.shms.model.Admission admission) {
        try {
            Map<String, Object> payload =
                    new HashMap<>();
            payload.put("recipientName",
                admission.getPatient()
                    .getUser().getName());
            payload.put("recipientEmail",
                admission.getPatient()
                    .getUser().getEmail());
            payload.put("recipientPhone",
                admission.getPatient()
                    .getUser().getPhone());
            payload.put("message",
                admission.getDischargeSummary());

            send("/discharge", payload);
        } catch (Exception ex) {
            System.out.println(
                "Discharge notification " +
                "failed: " + ex.getMessage());
        }
    }

    // ── Send insurance update notification ────────────────────────────
    public void sendInsuranceUpdate(
            com.shms.model.InsuranceClaim claim,
            String message) {
        try {
            Map<String, Object> payload =
                    new HashMap<>();
            payload.put("recipientName",
                claim.getPatient()
                    .getUser().getName());
            payload.put("recipientEmail",
                claim.getPatient()
                    .getUser().getEmail());
            payload.put("message", message);

            send("/insurance", payload);
        } catch (Exception ex) {
            System.out.println(
                "Insurance notification " +
                "failed: " + ex.getMessage());
        }
    }
}