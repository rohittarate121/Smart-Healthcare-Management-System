package com.shms.ai;

import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class SpecialistMapper {

    // Each specialty maps to a list of matching symptoms
    private static final Map<String,
            List<String>> SPECIALTY_MAP = new HashMap<>();

    static {
        SPECIALTY_MAP.put("Cardiologist", Arrays.asList(
            "chest pain", "heart attack", "palpitations",
            "shortness of breath", "irregular heartbeat",
            "high blood pressure", "fainting"
        ));

        SPECIALTY_MAP.put("Neurologist", Arrays.asList(
            "severe headache", "migraine", "seizure",
            "paralysis", "numbness", "dizziness",
            "stroke", "memory loss", "confusion"
        ));

        SPECIALTY_MAP.put("Dermatologist", Arrays.asList(
            "rash", "itching", "acne", "eczema",
            "hair loss", "skin lesion", "psoriasis",
            "hives", "dry skin"
        ));

        SPECIALTY_MAP.put("Gastroenterologist", Arrays.asList(
            "abdominal pain", "severe abdominal pain",
            "vomiting", "vomiting blood", "diarrhea",
            "constipation", "jaundice", "bloating",
            "nausea", "acid reflux"
        ));

        SPECIALTY_MAP.put("Orthopedist", Arrays.asList(
            "back pain", "joint pain", "knee pain",
            "fracture", "stiffness", "muscle pain",
            "arthritis", "neck pain", "shoulder pain"
        ));

        SPECIALTY_MAP.put("ENT Specialist", Arrays.asList(
            "sore throat", "ear pain", "hearing loss",
            "nasal congestion", "sinus", "tonsillitis",
            "runny nose", "sneezing", "hoarseness"
        ));

        SPECIALTY_MAP.put("Pulmonologist", Arrays.asList(
            "cough", "chronic cough", "asthma",
            "wheezing", "difficulty breathing",
            "chest tightness", "tuberculosis",
            "shortness of breath"
        ));

        SPECIALTY_MAP.put("General Physician", Arrays.asList(
            "fever", "high fever", "cold", "fatigue",
            "body ache", "flu", "weakness", "cold"
        ));
    }

    // ── Recommend specialist using voting algorithm ────────────────────────
    public String recommendSpecialist(List<String> symptoms) {

        Map<String, Integer> votes = new HashMap<>();

        // Count votes for each specialty
        for (String symptom : symptoms) {
            String symptomLower = symptom.toLowerCase().trim();

            for (Map.Entry<String,
                    List<String>> entry : SPECIALTY_MAP.entrySet()) {
                String specialty = entry.getKey();
                List<String> specialtySymptoms = entry.getValue();

                for (String s : specialtySymptoms) {
                    if (s.contains(symptomLower)
                            || symptomLower.contains(s)) {
                        votes.put(specialty,
                            votes.getOrDefault(specialty, 0) + 1);
                    }
                }
            }
        }

        // Return specialty with most votes
        return votes.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("General Physician");
    }

    // ── Get probable condition ─────────────────────────────────────────────
    public String getProbableCondition(
            List<String> symptoms, String specialty) {

        String symptomStr = symptoms.toString().toLowerCase();

        switch (specialty) {
            case "Cardiologist":
                if (symptomStr.contains("chest pain")
                        && symptomStr.contains("shortness of breath"))
                    return "Possible Cardiac Emergency / Angina";
                return "Possible Cardiac Condition";

            case "Neurologist":
                if (symptomStr.contains("seizure"))
                    return "Possible Seizure Disorder";
                if (symptomStr.contains("migraine"))
                    return "Possible Migraine";
                return "Possible Neurological Condition";

            case "Dermatologist":
                if (symptomStr.contains("rash")
                        && symptomStr.contains("itching"))
                    return "Possible Allergic Reaction / Eczema";
                return "Possible Skin Condition";

            case "Gastroenterologist":
                if (symptomStr.contains("vomiting blood"))
                    return "Possible GI Bleed — Urgent";
                if (symptomStr.contains("jaundice"))
                    return "Possible Liver Condition";
                return "Possible Gastrointestinal Condition";

            case "Orthopedist":
                if (symptomStr.contains("back pain"))
                    return "Possible Lumbar Strain / Disc Issue";
                return "Possible Musculoskeletal Condition";

            case "ENT Specialist":
                if (symptomStr.contains("sore throat"))
                    return "Possible Pharyngitis / Tonsillitis";
                return "Possible ENT Condition";

            case "Pulmonologist":
                if (symptomStr.contains("asthma")
                        || symptomStr.contains("wheezing"))
                    return "Possible Asthma / Bronchospasm";
                return "Possible Respiratory Condition";

            default:
                return "Possible Viral / Bacterial Infection";
        }
    }
}