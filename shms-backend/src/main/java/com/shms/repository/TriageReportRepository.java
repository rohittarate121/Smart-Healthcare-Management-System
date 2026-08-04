package com.shms.repository;

import com.shms.model.TriageReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TriageReportRepository
        extends JpaRepository<TriageReport, Long> {

    List<TriageReport> findByPatientPatientIdOrderByCreatedAtDesc(
            Long patientId);

    Optional<TriageReport> findBySessionSessionId(Long sessionId);
}