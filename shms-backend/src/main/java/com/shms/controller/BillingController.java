package com.shms.controller;

import com.shms.dto.*;
import com.shms.model.*;
import com.shms.service.BillingService;
import com.shms.service.InvoicePdfService;
import com.shms.service.PatientService;
import com.shms.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
    private InvoicePdfService invoicePdfService;

    @Autowired
    private JwtUtil jwtUtil;

    private Long getUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtUtil.extractUserId(token);
    }

    // ── Legacy / Standard Admit Patient ────────────────────────────────────
    @PostMapping("/admit")
    public ResponseEntity<Admission> admit(@Valid @RequestBody AdmissionRequestDTO dto) {
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
        return ResponseEntity.ok(billingService.getAvailableBeds());
    }

    // ── Step 2: Auto / Manual Charge Collection ───────────────────────────
    @PostMapping("/charges/add")
    public ResponseEntity<BillingCharge> addCharge(
            HttpServletRequest request,
            @Valid @RequestBody AddChargeDTO dto) {
        Long staffUserId = getUserId(request);
        BillingCharge charge = billingService.addCharge(dto, staffUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(charge);
    }

    // ── Step 3: Live Running Bill ──────────────────────────────────────────
    @GetMapping("/live-bill/{admissionId}")
    public ResponseEntity<LiveBillDTO> getLiveBill(@PathVariable Long admissionId) {
        LiveBillDTO liveBill = billingService.getLiveBill(admissionId);
        return ResponseEntity.ok(liveBill);
    }

    // ── Step 4 & 5: Discharge & Generate Final Invoice ──────────────────────
    @PostMapping("/discharge-invoice/{admissionId}")
    public ResponseEntity<InvoiceResponseDTO> generateDischargeInvoice(
            @PathVariable Long admissionId,
            @RequestBody DischargeBillingDTO dto) {
        InvoiceResponseDTO invoice = billingService.generateFinalInvoice(admissionId, dto);
        return ResponseEntity.ok(invoice);
    }

    // Legacy initiate discharge
    @PostMapping("/discharge/{admissionId}")
    public ResponseEntity<BillingResponseDTO> discharge(
            @PathVariable Long admissionId,
            @RequestBody DischargeRequestDTO dto) {
        BillingResponseDTO response = billingService.initiateDischarge(admissionId, dto);
        return ResponseEntity.ok(response);
    }

    // ── Step 6: PDF Download / Stream ───────────────────────────────────────
    @GetMapping("/invoices/{invoiceId}/pdf")
    public ResponseEntity<byte[]> getInvoicePdf(@PathVariable Long invoiceId) {
        InvoiceResponseDTO invoice = billingService.getInvoiceDetails(invoiceId);
        byte[] pdfBytes = invoicePdfService.generateInvoicePdf(invoice);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "Invoice_" + invoice.getInvoiceNumber() + ".pdf");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    @GetMapping("/invoices/{invoiceId}")
    public ResponseEntity<InvoiceResponseDTO> getInvoiceDetails(@PathVariable Long invoiceId) {
        return ResponseEntity.ok(billingService.getInvoiceDetails(invoiceId));
    }

    @GetMapping("/invoices/admission/{admissionId}")
    public ResponseEntity<InvoiceResponseDTO> getInvoiceByAdmission(@PathVariable Long admissionId) {
        return ResponseEntity.ok(billingService.getInvoiceByAdmission(admissionId));
    }

    // ── Step 7: Payments ────────────────────────────────────────────────────
    @PostMapping("/payments/process")
    public ResponseEntity<InvoiceResponseDTO> processPayment(
            @Valid @RequestBody PaymentTransactionDTO dto) {
        InvoiceResponseDTO updatedInvoice = billingService.processPayment(dto);
        return ResponseEntity.ok(updatedInvoice);
    }

    // Legacy confirm payment
    @PostMapping("/payment/confirm")
    public ResponseEntity<Payment> confirmPayment(
            HttpServletRequest request,
            @RequestBody PaymentRequestDTO dto) {
        Long userId = getUserId(request);
        Patient patient = patientService.getOrCreatePatient(userId);
        Payment payment = billingService.confirmPayment(patient.getPatientId(), dto);
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/payments/my")
    public ResponseEntity<List<Payment>> getMyPayments(HttpServletRequest request) {
        Long userId = getUserId(request);
        Patient patient = patientService.getOrCreatePatient(userId);
        List<Payment> payments = billingService.getPaymentHistory(patient.getPatientId());
        return ResponseEntity.ok(payments);
    }

    // ── Step 8: Search & History ───────────────────────────────────────────
    @GetMapping("/invoices/search")
    public ResponseEntity<List<InvoiceResponseDTO>> searchInvoices(
            @RequestParam(required = false, defaultValue = "") String query) {
        return ResponseEntity.ok(billingService.searchInvoices(query));
    }

    @GetMapping("/invoices/my")
    public ResponseEntity<List<InvoiceResponseDTO>> getMyInvoices(HttpServletRequest request) {
        Long userId = getUserId(request);
        Patient patient = patientService.getOrCreatePatient(userId);
        return ResponseEntity.ok(billingService.getPatientInvoices(patient.getPatientId()));
    }

    // ── Admin Claims & Admission Endpoints ────────────────────────────────
    @GetMapping("/claims")
    public ResponseEntity<List<InsuranceClaim>> getAllClaims() {
        return ResponseEntity.ok(billingService.getAllClaims());
    }

    @GetMapping("/claims/pending")
    public ResponseEntity<List<InsuranceClaim>> getPendingClaims() {
        return ResponseEntity.ok(billingService.getPendingClaims());
    }

    @PutMapping("/claims/{claimId}/status")
    public ResponseEntity<InsuranceClaim> updateClaim(
            @PathVariable Long claimId,
            @RequestBody InsuranceClaimUpdateDTO dto) {
        InsuranceClaim claim = billingService.updateClaimStatus(claimId, dto);
        return ResponseEntity.ok(claim);
    }

    @GetMapping("/admissions")
    public ResponseEntity<List<Admission>> getAllAdmissions() {
        return ResponseEntity.ok(billingService.getAllAdmissions());
    }

    @GetMapping("/admissions/active")
    public ResponseEntity<List<Admission>> getActiveAdmissions() {
        return ResponseEntity.ok(billingService.getActiveAdmissions());
    }
}