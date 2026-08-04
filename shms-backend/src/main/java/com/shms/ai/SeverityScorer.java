package com.shms.ai;

import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class SeverityScorer {

    // Symptom weight map - clinically informed values
    private static final Map<String, Integer> SYMPTOM_WEIGHTS = new HashMap<>();

    static {
        // CRITICAL weight symptoms (30-40)
        SYMPTOM_WEIGHTS.put("chest pain", 40);
        SYMPTOM_WEIGHTS.put("heart attack", 40);
        SYMPTOM_WEIGHTS.put("unconscious", 40);
        SYMPTOM_WEIGHTS.put("not breathing", 40);
        SYMPTOM_WEIGHTS.put("stroke", 40);
        SYMPTOM_WEIGHTS.put("seizure", 35);
        SYMPTOM_WEIGHTS.put("shortness of breath", 35);
        SYMPTOM_WEIGHTS.put("difficulty breathing", 35);
        SYMPTOM_WEIGHTS.put("severe bleeding", 35);
        SYMPTOM_WEIGHTS.put("paralysis", 35);

        // HIGH weight symptoms (20-29)
        SYMPTOM_WEIGHTS.put("high fever", 25);
        SYMPTOM_WEIGHTS.put("severe headache", 22);
        SYMPTOM_WEIGHTS.put("severe abdominal pain", 25);
        SYMPTOM_WEIGHTS.put("vomiting blood", 28);
        SYMPTOM_WEIGHTS.put("fainting", 22);
        SYMPTOM_WEIGHTS.put("palpitations", 20);
        SYMPTOM_WEIGHTS.put("severe dizziness", 20);
        SYMPTOM_WEIGHTS.put("numbness", 20);

        // MEDIUM weight symptoms (10-19)
        SYMPTOM_WEIGHTS.put("fever", 15);
        SYMPTOM_WEIGHTS.put("migraine", 16);
        SYMPTOM_WEIGHTS.put("back pain", 14);
        SYMPTOM_WEIGHTS.put("joint pain", 14);
        SYMPTOM_WEIGHTS.put("abdominal pain", 14);
        SYMPTOM_WEIGHTS.put("diarrhea", 12);
        SYMPTOM_WEIGHTS.put("vomiting", 12);
        SYMPTOM_WEIGHTS.put("headache", 12);
        SYMPTOM_WEIGHTS.put("ear pain", 11);
        SYMPTOM_WEIGHTS.put("sore throat", 10);
        SYMPTOM_WEIGHTS.put("rash", 10);
        SYMPTOM_WEIGHTS.put("cough", 10);
        SYMPTOM_WEIGHTS.put("wheezing", 14);
        SYMPTOM_WEIGHTS.put("asthma", 16);

        // LOW weight symptoms (1-9)
        SYMPTOM_WEIGHTS.put("fatigue", 8);
        SYMPTOM_WEIGHTS.put("cold", 5);
        SYMPTOM_WEIGHTS.put("runny nose", 5);
        SYMPTOM_WEIGHTS.put("itching", 5);
        SYMPTOM_WEIGHTS.put("acne", 4);
        SYMPTOM_WEIGHTS.put("hair loss", 4);
        SYMPTOM_WEIGHTS.put("mild headache", 6);
        SYMPTOM_WEIGHTS.put("body ache", 8);
        SYMPTOM_WEIGHTS.put("sneezing", 4);
        SYMPTOM_WEIGHTS.put("nasal congestion", 5);
        SYMPTOM_WEIGHTS.put("stiffness", 8);
    }

    // ── STEP 1: Sum symptom weights ───────────────────────────────────────
    public int sumSymptomWeights(List<String> symptoms) {
        int total = 0;
        for (String symptom : symptoms) {
            String key = symptom.toLowerCase().trim();
            total += SYMPTOM_WEIGHTS.getOrDefault(key, 5);
        }
        return total;
    }

    // ── STEP 2: Apply duration multiplier ─────────────────────────────────
    public double applyDurationMultiplier(int baseScore, int durationDays) {
        if (durationDays <= 1) return baseScore * 1.2;
        if (durationDays <= 3) return baseScore * 1.0;
        if (durationDays <= 7) return baseScore * 0.9;
        return baseScore * 0.8;
    }

    // ── STEP 3: Add follow-up bonuses ─────────────────────────────────────
    public int addFollowUpBonuses(Map<String, String> followUpAnswers) {
        int bonus = 0;

        if (followUpAnswers == null) return bonus;

        String worsening = followUpAnswers.get("worsening");
        if ("rapidly".equalsIgnoreCase(worsening)) bonus += 10;
        else if ("slightly".equalsIgnoreCase(worsening)) bonus += 4;

        String ageGroup = followUpAnswers.get("ageGroup");
        if ("elderly".equalsIgnoreCase(ageGroup)) bonus += 10;
        else if ("child".equalsIgnoreCase(ageGroup)) bonus += 8;

        String condition = followUpAnswers.get("condition");
        if (condition != null) {
            if (condition.contains("diabetic")) bonus += 7;
            if (condition.contains("hypertension")) bonus += 6;
            if (condition.contains("cardiac")) bonus += 8;
        }

        return bonus;
    }

    // ── MAIN: Calculate final score ───────────────────────────────────────
    public int calculateScore(
            List<String> symptoms,
            int durationDays,
            Map<String, String> followUpAnswers) {

        int baseScore = sumSymptomWeights(symptoms);
        double afterMultiplier = applyDurationMultiplier(baseScore, durationDays);
        int bonuses = addFollowUpBonuses(followUpAnswers);
        int finalScore = (int) Math.round(afterMultiplier) + bonuses;

        // Cap at 100
        return Math.min(finalScore, 100);
    }

    // ── Get urgency level from score ──────────────────────────────────────
    public String getUrgencyLevel(int score) {
        if (score >= 70) return "CRITICAL";
        if (score >= 45) return "HIGH";
        if (score >= 20) return "MEDIUM";
        return "LOW";
    }
}