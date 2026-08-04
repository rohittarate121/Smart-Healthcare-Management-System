package com.shms.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "lab_reports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "lab_report_id")
    private Long labReportId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appt_id")
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordered_by")
    private Doctor orderedBy;

    @Column(name = "test_name",
            nullable = false, length = 200)
    private String testName;

    @Column(name = "report_file_url", length = 500)
    private String reportFileUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "source", length = 20)
    private ReportSource source = ReportSource.HOSPITAL_LAB;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private ReportStatus status = ReportStatus.PENDING;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "upload_date", updatable = false)
    private LocalDateTime uploadDate;

    public enum ReportSource {
        HOSPITAL_LAB, EXTERNAL
    }

    public enum ReportStatus {
        PENDING, UPLOADED, REVIEWED
    }
}