package com.shms.controller;

import com.shms.dto.AdmissionRequestDTO;
import com.shms.dto.BillingResponseDTO;
import com.shms.dto.DischargeRequestDTO;
import com.shms.dto.InsuranceClaimUpdateDTO;
import com.shms.dto.PaymentRequestDTO;
import com.shms.model.*;
import com.shms.service.BillingService;
import com.shms.service.PatientService;
import com.shms.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    @Autowired
    private BillingService billingService;

    @Autowired
    private PatientService patientService;

    @Autowired
    private JwtUtil jwtUtil;

    private Long getUserId(HttpServletRequest request) {
        String token = request
                .getHeader("Authorization").substring(7);
        return jwtUtil.extractUserId(token);
    }

    // ── Admit patient ─────────────────────────────────────────────────────
    @PostMapping("/admit")
    public ResponseEntity<Admission> admit(
            @RequestBody AdmissionRequestDTO dto) {
        Admission admission = billingService.admitPatient(
                dto.getPatientId(),
                dto.getDoctorId(),
                dto.getBedId(),
                dto.getAdmissionReason());
        return ResponseEntity.ok(admission);
    }

    // ── Get available beds ────────────────────────────────────────────────
    @GetMapping("/beds/available")
    public ResponseEntity<List<Bed>> getAvailableBeds() {
        return ResponseEntity.ok(
                billingService.getAvailableBeds());
    }

    // ── Initiate discharge (generates bill) ───────────────────────────────
    @PostMapping("/discharge/{admissionId}")
    public ResponseEntity<BillingResponseDTO> discharge(
            @PathVariable Long admissionId,
            @RequestBody DischargeRequestDTO dto) {
        BillingResponseDTO response =
                billingService.initiateDischarge(
                    admissionId, dto);
        return ResponseEntity.ok(response);
    }

    // ── Confirm payment ───────────────────────────────────────────────────
    @PostMapping("/payment/confirm")
    public ResponseEntity<Payment> confirmPayment(
            HttpServletRequest request,
            @RequestBody PaymentRequestDTO dto) {
        Long userId = getUserId(request);
        Patient patient =
                patientService.getOrCreatePatient(userId);
        Payment payment = billingService.confirmPayment(
                patient.getPatientId(), dto);
        return ResponseEntity.ok(payment);
    }

    // ── Get payment history ───────────────────────────────────────────────
    @GetMapping("/payments/my")
    public ResponseEntity<List<Payment>> getMyPayments(
            HttpServletRequest request) {
        Long userId = getUserId(request);
        Patient patient =
                patientService.getOrCreatePatient(userId);
        List<Payment> payments = billingService
                .getPaymentHistory(patient.getPatientId());
        return ResponseEntity.ok(payments);
    }

    // ── Admin — view all claims ───────────────────────────────────────────
    @GetMapping("/claims")
    public ResponseEntity<List<InsuranceClaim>> getAllClaims() {
        return ResponseEntity.ok(
                billingService.getAllClaims());
    }

    // ── Admin — view pending claims ───────────────────────────────────────
    @GetMapping("/claims/pending")
    public ResponseEntity<List<InsuranceClaim>> getPendingClaims() {
        return ResponseEntity.ok(
                billingService.getPendingClaims());
    }

    // ── Admin — approve or reject claim ──────────────────────────────────
    @PutMapping("/claims/{claimId}/status")
    public ResponseEntity<InsuranceClaim> updateClaim(
            @PathVariable Long claimId,
            @RequestBody InsuranceClaimUpdateDTO dto) {
        InsuranceClaim claim =
                billingService.updateClaimStatus(
                    claimId, dto);
        return ResponseEntity.ok(claim);
    }

    // ── Admin — view all admissions ───────────────────────────────────────
    @GetMapping("/admissions")
    public ResponseEntity<List<Admission>> getAllAdmissions() {
        return ResponseEntity.ok(
                billingService.getAllAdmissions());
    }

    // ── Admin — view active admissions ────────────────────────────────────
    @GetMapping("/admissions/active")
    public ResponseEntity<List<Admission>> getActiveAdmissions() {
        return ResponseEntity.ok(
                billingService.getActiveAdmissions());
    }
}