package com.shms.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "beds")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Bed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bed_id")
    private Long bedId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ward_id", nullable = false)
    private Ward ward;

    @Column(name = "bed_number",
            nullable = false, length = 20)
    private String bedNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "bed_type", length = 20)
    private BedType bedType;

    @Column(name = "is_occupied")
    private Boolean isOccupied = false;

    @Column(name = "daily_charge",
            precision = 8, scale = 2)
    private BigDecimal dailyCharge;

    public enum BedType {
        GENERAL, SEMI_PRIVATE, PRIVATE, ICU
    }
}