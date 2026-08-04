package com.shms.service;

import com.shms.ai.TriageEngine;
import com.shms.ai.TriageResult;
import com.shms.dto.SymptomInputDTO;
import com.shms.dto.TriageResponseDTO;
import com.shms.model.Patient;
import com.shms.model.SymptomSession;
import com.shms.model.TriageReport;
import com.shms.repository.SymptomSessionRepository;
import com.shms.repository.TriageReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TriageService {

    @Autowired
    private TriageEngine triageEngine;

    @Autowired
    private SymptomSessionRepository sessionRepository;

    @Autowired
    private TriageReportRepository reportRepository;

    @Autowired
    private PatientService patientService;

    // ── Run triage analysis ───────────────────────────────────────────────
    public TriageResponseDTO analyse(Long userId, SymptomInputDTO input) {

        // Get or create patient profile
        Patient patient = patientService.getOrCreatePatient(userId);

        // Save symptom session
        SymptomSession session = SymptomSession.builder()
                .patient(patient)
                .structuredSymptoms(input.getSymptoms())
                .bodyArea(input.getBodyArea())
                .durationDays(input.getDurationDays())
                .language(input.getLanguage() != null
                        ? input.getLanguage() : "EN")
                .followUpAnswers(input.getFollowUpAnswers())
                .build();

        session = sessionRepository.save(session);

        // Run AI triage engine
        TriageResult result = triageEngine.runTriage(
                input.getSymptoms(),
                input.getDurationDays(),
                input.getFollowUpAnswers()
        );

        // Save triage report
        TriageReport report = TriageReport.builder()
                .session(session)
                .patient(patient)
                .severityScore(result.getSeverityScore())
                .urgencyLevel(TriageReport.UrgencyLevel
                        .valueOf(result.getUrgencyLevel()))
                .probableCondition(result.getProbableCondition())
                .recommendedSpecialty(result.getRecommendedSpecialty())
                .triageSummary(result.getTriageSummary())
                .isEmergency(result.isEmergency())
                .build();

        report = reportRepository.save(report);

        // Build and return response
        return TriageResponseDTO.builder()
                .sessionId(session.getSessionId())
                .reportId(report.getReportId())
                .severityScore(result.getSeverityScore())
                .urgencyLevel(result.getUrgencyLevel())
                .recommendedSpecialty(result.getRecommendedSpecialty())
                .probableCondition(result.getProbableCondition())
                .triageSummary(result.getTriageSummary())
                .isEmergency(result.isEmergency())
                .message(result.isEmergency()
                        ? "EMERGENCY: Go to ER immediately."
                        : "Triage complete. See recommended specialist.")
                .build();
    }

    // ── Get triage history for patient ────────────────────────────────────
    public List<TriageReport> getHistory(Long userId) {
        Patient patient = patientService.getOrCreatePatient(userId);
        return reportRepository
                .findByPatientPatientIdOrderByCreatedAtDesc(
                        patient.getPatientId());
    }
}