package com.shms.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "admissions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Admission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "admission_id")
    private Long admissionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bed_id", nullable = false)
    private Bed bed;

    @Column(name = "admission_reason",
            columnDefinition = "TEXT")
    private String admissionReason;

    @Column(name = "discharge_summary",
            columnDefinition = "TEXT")
    private String dischargeSummary;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private AdmissionStatus status
            = AdmissionStatus.ADMITTED;

    @CreationTimestamp
    @Column(name = "admitted_at", updatable = false)
    private LocalDateTime admittedAt;

    @Column(name = "discharged_at")
    private LocalDateTime dischargedAt;

    public enum AdmissionStatus {
        ADMITTED, DISCHARGED
    }
}