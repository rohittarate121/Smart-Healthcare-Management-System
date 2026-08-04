package com.shms.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "symptom_sessions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SymptomSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_id")
    private Long sessionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "structured_symptoms", columnDefinition = "json")
    private List<String> structuredSymptoms;

    @Column(name = "body_area", length = 100)
    private String bodyArea;

    @Column(name = "duration_days")
    private Integer durationDays;

    @Column(name = "language", length = 5)
    private String language = "EN";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "follow_up_answers", columnDefinition = "json")
    private Map<String, String> followUpAnswers;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}