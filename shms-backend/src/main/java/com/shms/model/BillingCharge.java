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
@Table(name = "billing_charges")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillingCharge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "charge_id")
    private Long chargeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private BillingAccount account;

    @Column(name = "charge_name", length = 150, nullable = false)
    private String chargeName;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", length = 50, nullable = false)
    private ChargeCategory category;

    @Column(name = "amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "quantity", nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    @Column(name = "total_amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @CreationTimestamp
    @Column(name = "charge_date", updatable = false)
    private LocalDateTime chargeDate;

    @Column(name = "created_by_user_id")
    private Long createdByUserId;

    @Column(name = "notes", length = 255)
    private String notes;

    public enum ChargeCategory {
        ROOM,
        DOCTOR_CONSULTATION,
        SPECIALIST_CONSULTATION,
        MEDICINE,
        LABORATORY,
        RADIOLOGY,
        OPERATION,
        ICU,
        NURSING,
        INJECTION,
        EMERGENCY,
        AMBULANCE,
        EQUIPMENT,
        MISCELLANEOUS
    }
}
