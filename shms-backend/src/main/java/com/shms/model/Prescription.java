package com.shms.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "prescriptions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "prescription_id")
    private Long prescriptionId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appt_id",
                nullable = false, unique = true)
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "diagnosis",
            columnDefinition = "TEXT")
    private String diagnosis;

    @Column(name = "advice",
            columnDefinition = "TEXT")
    private String advice;

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;

    // One prescription has many medicine items
    @OneToMany(
        mappedBy = "prescription",
        cascade = CascadeType.ALL,
        fetch = FetchType.LAZY
    )
    private List<PrescriptionItem> items;

    @CreationTimestamp
    @Column(name = "issued_at", updatable = false)
    private LocalDateTime issuedAt;
}