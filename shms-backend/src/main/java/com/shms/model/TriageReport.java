package com.shms.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "triage_reports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TriageReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long reportId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false, unique = true)
    private SymptomSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "severity_score", nullable = false)
    private Integer severityScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "urgency_level", nullable = false)
    private UrgencyLevel urgencyLevel;

    @Column(name = "probable_condition", length = 200)
    private String probableCondition;

    @Column(name = "recommended_specialty", length = 100)
    private String recommendedSpecialty;

    @Column(name = "triage_summary", columnDefinition = "TEXT")
    private String triageSummary;

    @Column(name = "is_emergency")
    private Boolean isEmergency = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum UrgencyLevel {
        LOW, MEDIUM, HIGH, CRITICAL
    }
}