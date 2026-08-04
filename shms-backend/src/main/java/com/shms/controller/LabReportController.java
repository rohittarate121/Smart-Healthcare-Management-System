package com.shms.controller;

import com.shms.dto.LabReportRequestDTO;
import com.shms.model.LabReport;
import com.shms.repository.LabReportRepository;
import com.shms.service.LabReportService;
import com.shms.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lab-reports")
public class LabReportController {

    @Autowired
    private LabReportService labReportService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private LabReportRepository labReportRepository;
    
    private Long getUserId(HttpServletRequest request) {
        String token = request
                .getHeader("Authorization").substring(7);
        return jwtUtil.extractUserId(token);
    }

    // ── Doctor orders a lab test ──────────────────────────────────────────
    @PostMapping("/order")
    public ResponseEntity<LabReport> orderTest(
            HttpServletRequest request,
            @RequestBody LabReportRequestDTO dto) {
        Long userId = getUserId(request);
        LabReport report =
                labReportService.orderTest(userId, dto);
        return ResponseEntity.ok(report);
    }
    
 // ── Doctor views lab reports for a specific patient ───────────────────
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<LabReport>>
            getPatientReports(
                @PathVariable Long patientId) {
        List<LabReport> reports = labReportRepository
                .findByPatientPatientId(patientId);
        return ResponseEntity.ok(reports);
    }

    // ── Lab tech uploads result ───────────────────────────────────────────
    @PutMapping("/{labReportId}/upload")
    public ResponseEntity<LabReport> uploadReport(
            @PathVariable Long labReportId,
            @RequestParam String fileUrl,
            @RequestParam(required = false) String notes) {
        LabReport report = labReportService
                .uploadReport(labReportId, fileUrl, notes);
        return ResponseEntity.ok(report);
    }

    // ── Patient uploads external report ──────────────────────────────────
    @PostMapping("/upload-external")
    public ResponseEntity<LabReport> uploadExternal(
            HttpServletRequest request,
            @RequestParam String testName,
            @RequestParam String fileUrl,
            @RequestParam(required = false) String notes) {
        Long userId = getUserId(request);
        LabReport report = labReportService
                .uploadExternalReport(
                    userId, testName, fileUrl, notes);
        return ResponseEntity.ok(report);
    }

    // ── Patient views their lab reports ──────────────────────────────────
    @GetMapping("/my")
    public ResponseEntity<List<LabReport>> getMyReports(
            HttpServletRequest request) {
        Long userId = getUserId(request);
        List<LabReport> reports =
                labReportService.getPatientReports(userId);
        return ResponseEntity.ok(reports);
    }

    // ── Lab tech views pending orders ─────────────────────────────────────
    @GetMapping("/pending")
    public ResponseEntity<List<LabReport>> getPendingOrders() {
        List<LabReport> reports =
                labReportService.getPendingOrders();
        return ResponseEntity.ok(reports);
    }

    // ── Doctor marks report reviewed ──────────────────────────────────────
    @PutMapping("/{labReportId}/reviewed")
    public ResponseEntity<LabReport> markReviewed(
            @PathVariable Long labReportId) {
        LabReport report =
                labReportService.markReviewed(labReportId);
        return ResponseEntity.ok(report);
    }
    
 // ── Get all lab reports (lab tech view) ───────────────────────────────
    @GetMapping("/all")
    public ResponseEntity<List<LabReport>> getAllReports() {
        return ResponseEntity.ok(
                labReportRepository.findAll());
}
}