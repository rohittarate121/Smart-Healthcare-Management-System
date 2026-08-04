package com.shms.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "patient_allergies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientAllergy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "allergy_id")
    private Long allergyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "allergen", nullable = false, length = 200)
    private String allergen;

    @Column(name = "reaction", length = 200)
    private String reaction;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", length = 10)
    private Severity severity;

    // Critical field - used during prescription generation
    @Column(name = "is_drug_allergy")
    private Boolean isDrugAllergy = false;

    public enum Severity {
        MILD, MODERATE, SEVERE
    }
}