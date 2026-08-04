package com.shms.controller;

import com.shms.dto.*;
import com.shms.model.*;
import com.shms.repository.PatientMedicalHistoryRepository;
import com.shms.repository.PatientAllergyRepository;
import com.shms.repository.PatientRepository;
import com.shms.service.PatientService;
import com.shms.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private PatientAllergyRepository allergyRepository;

    @Autowired
    private PatientMedicalHistoryRepository historyRepository;

    // Helper — extract userId from JWT token in request header
    private Long getUserIdFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        String token = authHeader.substring(7);
        return jwtUtil.extractUserId(token);
    }

    // ── GET PROFILE ───────────────────────────────────────────────────────
    @GetMapping("/profile")
    public ResponseEntity<Patient> getProfile(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        Patient patient = patientService.getProfile(userId);
        return ResponseEntity.ok(patient);
    }

    // ── UPDATE PROFILE ────────────────────────────────────────────────────
    @PutMapping("/profile")
    public ResponseEntity<Patient> updateProfile(
            HttpServletRequest request,
            @RequestBody PatientProfileRequest profileRequest) {
        Long userId = getUserIdFromRequest(request);
        Patient patient = patientService.updateProfile(userId, profileRequest);
        return ResponseEntity.ok(patient);
    }

    // ── ADD MEDICAL HISTORY ───────────────────────────────────────────────
    @PostMapping("/medical-history")
    public ResponseEntity<PatientMedicalHistory> addMedicalHistory(
            HttpServletRequest request,
            @RequestBody MedicalHistoryRequest historyRequest) {
        Long userId = getUserIdFromRequest(request);
        PatientMedicalHistory history =
                patientService.addMedicalHistory(userId, historyRequest);
        return ResponseEntity.ok(history);
    }

    // ── GET MEDICAL HISTORY ───────────────────────────────────────────────
    @GetMapping("/medical-history")
    public ResponseEntity<List<PatientMedicalHistory>> getMedicalHistory(
            HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        List<PatientMedicalHistory> history =
                patientService.getMedicalHistory(userId);
        return ResponseEntity.ok(history);
    }

    // ── ADD ALLERGY ───────────────────────────────────────────────────────
    @PostMapping("/allergies")
    public ResponseEntity<PatientAllergy> addAllergy(
            HttpServletRequest request,
            @RequestBody AllergyRequest allergyRequest) {
        Long userId = getUserIdFromRequest(request);
        PatientAllergy allergy =
                patientService.addAllergy(userId, allergyRequest);
        return ResponseEntity.ok(allergy);
    }

    // ── GET ALLERGIES ─────────────────────────────────────────────────────
    @GetMapping("/allergies")
    public ResponseEntity<List<PatientAllergy>> getAllergies(
            HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        List<PatientAllergy> allergies =
                patientService.getAllergies(userId);
        return ResponseEntity.ok(allergies);
    }

    // ── ADD INSURANCE ─────────────────────────────────────────────────────
    @PostMapping("/insurance")
    public ResponseEntity<PatientInsurance> addInsurance(
            HttpServletRequest request,
            @RequestBody InsuranceRequest insuranceRequest) {
        Long userId = getUserIdFromRequest(request);
        PatientInsurance insurance =
                patientService.addInsurance(userId, insuranceRequest);
        return ResponseEntity.ok(insurance);
    }

    // ── GET INSURANCE ─────────────────────────────────────────────────────
    @GetMapping("/insurance")
    public ResponseEntity<List<PatientInsurance>> getInsurance(
            HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        List<PatientInsurance> insurance =
                patientService.getInsurance(userId);
        return ResponseEntity.ok(insurance);
    }
 // ── Get specific patient profile (for doctor view) ────────────────────
    @GetMapping("/profile/{patientId}")
    public ResponseEntity<Patient> getPatientById(
            @PathVariable Long patientId) {
        Patient patient = patientRepository
                .findById(patientId)
                .orElseThrow(() ->
                    new RuntimeException(
                        "Patient not found"));
        return ResponseEntity.ok(patient);
    }

    // ── Get specific patient allergies (for doctor) ───────────────────────
    @GetMapping("/{patientId}/allergies")
    public ResponseEntity<List<PatientAllergy>>
            getPatientAllergies(
                @PathVariable Long patientId) {
        List<PatientAllergy> allergies =
                allergyRepository
                    .findByPatientPatientId(patientId);
        return ResponseEntity.ok(allergies);
    }

    // ── Get specific patient medical history (for doctor) ─────────────────
    @GetMapping("/{patientId}/medical-history")
    public ResponseEntity<List<PatientMedicalHistory>>
            getPatientHistory(
                @PathVariable Long patientId) {
        List<PatientMedicalHistory> history =
                historyRepository
                    .findByPatientPatientId(patientId);
        return ResponseEntity.ok(history);
    }
    
}