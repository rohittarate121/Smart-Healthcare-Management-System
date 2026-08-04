package com.shms.service;

import com.shms.dto.CreateDoctorProfileDTO;
import com.shms.dto.DashboardStatsDTO;
import com.shms.dto.UserStatusUpdateDTO;
import com.shms.model.*;
import com.shms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private AdmissionRepository admissionRepository;

    @Autowired
    private BedRepository bedRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private InsuranceClaimRepository claimRepository;

    @Autowired
    private LabReportRepository labReportRepository;

    @Autowired
    private NotificationLogRepository notifRepository;

    // ── Dashboard summary stats ───────────────────────────────────────────
    public DashboardStatsDTO getDashboardStats() {

        // Count totals
        long totalPatients = patientRepository.count();
        long totalDoctors = doctorRepository.count();
        long totalAppointments = appointmentRepository.count();
        long totalAdmissions = admissionRepository.count();

        // Active admissions
        long activeAdmissions = admissionRepository
                .findByStatus(
                    Admission.AdmissionStatus.ADMITTED)
                .size();

        // Bed stats
        long bedsAvailable = bedRepository
                .findByIsOccupiedFalse().size();
        long totalBeds = bedRepository.count();
        long bedsOccupied = totalBeds - bedsAvailable;

        // Revenue — sum all successful payments
        double totalRevenue = paymentRepository
                .findAll()
                .stream()
                .filter(p -> p.getStatus()
                        == Payment.PaymentStatus.SUCCESS)
                .mapToDouble(p -> p.getAmount()
                        .doubleValue())
                .sum();

        // Pending insurance claims
        long pendingClaims = claimRepository
                .findByStatus(
                    InsuranceClaim.ClaimStatus.SUBMITTED)
                .size();

        // Pending lab reports
        long pendingLabs = labReportRepository
                .findAll()
                .stream()
                .filter(r -> r.getStatus()
                        == LabReport.ReportStatus.PENDING)
                .count();

        return DashboardStatsDTO.builder()
                .totalPatients(totalPatients)
                .totalDoctors(totalDoctors)
                .totalAppointments(totalAppointments)
                .totalAdmissions(totalAdmissions)
                .admissionsActive(activeAdmissions)
                .bedsAvailable(bedsAvailable)
                .bedsOccupied(bedsOccupied)
                .totalRevenue(totalRevenue)
                .pendingInsuranceClaims(pendingClaims)
                .pendingLabReports(pendingLabs)
                .build();
    }

    // ── Get all users ─────────────────────────────────────────────────────
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ── Get users by role ─────────────────────────────────────────────────
    public List<User> getUsersByRole(User.Role role) {
        return userRepository.findAll()
                .stream()
                .filter(u -> u.getRole() == role)
                .toList();
    }

    // ── Activate or deactivate user ───────────────────────────────────────
    public User updateUserStatus(
            Long userId,
            UserStatusUpdateDTO dto) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                    new RuntimeException("User not found"));

        user.setIsActive(dto.getIsActive());
        User saved = userRepository.save(user);

        System.out.println("====================================");
        System.out.println("USER "
            + (dto.getIsActive() ? "ACTIVATED" : "DEACTIVATED")
            + ": " + user.getEmail());
        System.out.println("====================================");

        return saved;
    }

    // ── Get all doctors ───────────────────────────────────────────────────
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    // ── Get all patients ──────────────────────────────────────────────────
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    // ── Get all appointments ──────────────────────────────────────────────
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    // ── Revenue by payment type ───────────────────────────────────────────
    public java.util.Map<String, Double> getRevenueByType() {

        java.util.Map<String, Double> revenue =
                new java.util.HashMap<>();

        paymentRepository.findAll()
                .stream()
                .filter(p -> p.getStatus()
                        == Payment.PaymentStatus.SUCCESS)
                .forEach(p -> {
                    String type = p.getPaymentType().name();
                    revenue.merge(type,
                        p.getAmount().doubleValue(),
                        Double::sum);
                });

        return revenue;
    }

    // ── Notification logs ─────────────────────────────────────────────────
    public List<NotificationLog> getAllNotifications() {
        return notifRepository.findAll();
    }

    // ── Create in-app notification ────────────────────────────────────────
    public NotificationLog createInAppNotification(
            User user,
            String subject,
            String message) {

        NotificationLog log = NotificationLog.builder()
                .user(user)
                .channel(NotificationLog.Channel.IN_APP)
                .subject(subject)
                .message(message)
                .status(NotificationLog.NotifStatus.SENT)
                .build();

        return notifRepository.save(log);
    }

    // ── Get unread notifications for user ─────────────────────────────────
    public List<NotificationLog> getUnreadNotifications(
            Long userId) {
        return notifRepository
                .findByUserUserIdAndReadAtIsNull(userId);
    }

    // ── Mark notification as read ─────────────────────────────────────────
    public NotificationLog markAsRead(Long notifId) {

        NotificationLog log = notifRepository
                .findById(notifId)
                .orElseThrow(() ->
                    new RuntimeException(
                        "Notification not found"));

        log.setReadAt(java.time.LocalDateTime.now());
        return notifRepository.save(log);
    }
}