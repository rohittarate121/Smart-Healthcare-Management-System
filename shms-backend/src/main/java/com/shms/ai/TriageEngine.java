package com.shms.ai;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class TriageEngine {

    @Autowired
    private SeverityScorer severityScorer;

    @Autowired
    private SpecialistMapper specialistMapper;

    // ── Run complete triage ───────────────────────────────────────────────
    public TriageResult runTriage(
            List<String> symptoms,
            int durationDays,
            Map<String, String> followUpAnswers) {

        // Step 1: Calculate severity score
        int score = severityScorer.calculateScore(
                symptoms, durationDays, followUpAnswers);

        // Step 2: Get urgency level
        String urgencyLevel = severityScorer.getUrgencyLevel(score);

        // Step 3: Recommend specialist
        String specialty = specialistMapper.recommendSpecialist(symptoms);

        // Step 4: Get probable condition
        String condition = specialistMapper
                .getProbableCondition(symptoms, specialty);

        // Step 5: Detect emergency
        boolean isEmergency = score >= 70;

        // Step 6: Build summary
        String summary = buildSummary(urgencyLevel, specialty, isEmergency);

        return TriageResult.builder()
                .severityScore(score)
                .urgencyLevel(urgencyLevel)
                .recommendedSpecialty(specialty)
                .probableCondition(condition)
                .isEmergency(isEmergency)
                .triageSummary(summary)
                .build();
    }

    // ── Build human-readable summary ──────────────────────────────────────
    private String buildSummary(
            String urgencyLevel,
            String specialty,
            boolean isEmergency) {

        if (isEmergency) {
            return "CRITICAL: Your symptoms indicate a potential medical " +
                   "emergency. Please go to the nearest Emergency Room " +
                   "immediately. Do not delay.";
        }

        switch (urgencyLevel) {
            case "HIGH":
                return "HIGH urgency: Please see a " + specialty +
                       " today or tomorrow. Do not ignore these symptoms.";
            case "MEDIUM":
                return "MEDIUM urgency: Book an appointment with a " +
                       specialty + " within 48 hours.";
            default:
                return "LOW urgency: Your symptoms appear mild. " +
                       "You can schedule a routine appointment with a " +
                       specialty + " at your convenience.";
        }
    }
}