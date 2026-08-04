package com.shms.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "insurance_claims")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InsuranceClaim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "claim_id")
    private Long claimId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "insurance_id", nullable = false)
    private PatientInsurance insurance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admission_id")
    private Admission admission;

    @Column(name = "total_bill",
            precision = 12, scale = 2)
    private BigDecimal totalBill;

    @Column(name = "claimed_amount",
            precision = 12, scale = 2)
    private BigDecimal claimedAmount;

    @Column(name = "approved_amount",
            precision = 12, scale = 2)
    private BigDecimal approvedAmount;

    @Column(name = "patient_copay",
            precision = 12, scale = 2)
    private BigDecimal patientCopay;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private ClaimStatus status
            = ClaimStatus.SUBMITTED;

    @Column(name = "rejection_reason",
            columnDefinition = "TEXT")
    private String rejectionReason;

    @CreationTimestamp
    @Column(name = "submitted_at", updatable = false)
    private LocalDateTime submittedAt;

    @Column(name = "settled_at")
    private LocalDateTime settledAt;

    public enum ClaimStatus {
        SUBMITTED,
        UNDER_REVIEW,
        APPROVED,
        REJECTED,
        PARTIAL
    }
}