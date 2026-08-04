package com.shms.controller;

import com.shms.dto.PrescriptionRequestDTO;
import com.shms.dto.PrescriptionResponseDTO;
import com.shms.model.Patient;
import com.shms.model.Prescription;
import com.shms.service.PatientService;
import com.shms.service.PrescriptionService;
import com.shms.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    @Autowired
    private PrescriptionService prescriptionService;

    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private PatientService patientService;

    private Long getUserId(HttpServletRequest request) {
        String token = request
                .getHeader("Authorization").substring(7);
        return jwtUtil.extractUserId(token);
    }

    // ── Doctor creates prescription ───────────────────────────────────────
    @PostMapping
    public ResponseEntity<PrescriptionResponseDTO> create(
            HttpServletRequest request,
            @RequestBody PrescriptionRequestDTO dto) {
        Long userId = getUserId(request);
        PrescriptionResponseDTO response =
                prescriptionService.create(userId, dto);
        return ResponseEntity.ok(response);
    }

 // ── Doctor views prescriptions for specific patient ───────────────────
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Prescription>>
            getPatientPrescriptions(
                @PathVariable Long patientId) {
        List<Prescription> prescriptions =
                prescriptionService
                    .getPatientPrescriptions(patientId);
        return ResponseEntity.ok(prescriptions);
    }
    
    // ── Patient views their prescriptions ─────────────────────────────────
    @GetMapping("/my")
    public ResponseEntity<List<Prescription>> getMyPrescriptions(
            HttpServletRequest request) {
        Long userId = getUserId(request);
        
     // First get the patient record from userId
        Patient patient = patientService
                .getOrCreatePatient(userId);
        
        // Get patientId from userId
        List<Prescription> prescriptions =
                prescriptionService
                    .getPatientPrescriptions(userId);
        return ResponseEntity.ok(prescriptions);
    }

    // ── Get prescription by appointment ──────────────────────────────────
    @GetMapping("/appointment/{apptId}")
    public ResponseEntity<Prescription> getByAppointment(
            @PathVariable Long apptId) {
        Prescription prescription =
                prescriptionService.getByAppointment(apptId);
        return ResponseEntity.ok(prescription);
    }
}