package com.shms.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "appt_id")
    private Long apptId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "avail_id")
    private DoctorAvailability slot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "triage_report_id")
    private TriageReport triageReport;

    @Enumerated(EnumType.STRING)
    @Column(name = "appt_type", length = 20)
    private AppointmentType apptType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private AppointmentStatus status
            = AppointmentStatus.PENDING;

    @Column(name = "consultation_notes",
            columnDefinition = "TEXT")
    private String consultationNotes;

    @Column(name = "diagnosis",
            columnDefinition = "TEXT")
    private String diagnosis;

    @Column(name = "follow_up_date")
    private LocalDateTime followUpDate;

    @Column(name = "cancellation_reason",
            columnDefinition = "TEXT")
    private String cancellationReason;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum AppointmentType {
        OPD, EMERGENCY, FOLLOW_UP
    }

    public enum AppointmentStatus {
        PENDING, CONFIRMED, CHECKED_IN,
        IN_PROGRESS, COMPLETED,
        CANCELLED, NO_SHOW
    }
}