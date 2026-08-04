package com.shms.service;

import com.shms.dto.LabReportRequestDTO;
import com.shms.model.*;
import com.shms.repository.*;
import com.shms.util.NotificationClient;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LabReportService {

    @Autowired
    private LabReportRepository labReportRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private PatientService patientService;
    
    @Autowired
    private NotificationClient notificationClient;

    // ── Order lab test (doctor orders) ────────────────────────────────────
    public LabReport orderTest(
            Long doctorUserId,
            LabReportRequestDTO request) {

        Doctor doctor = doctorService
                .getDoctorByUserId(doctorUserId);

        Patient patient = patientRepository
                .findById(request.getPatientId())
                .orElseThrow(() ->
                    new RuntimeException("Patient not found"));

        Appointment appointment = null;
        if (request.getApptId() != null) {
            appointment = appointmentRepository
                    .findById(request.getApptId())
                    .orElse(null);
        }

        LabReport report = LabReport.builder()
                .patient(patient)
                .appointment(appointment)
                .orderedBy(doctor)
                .testName(request.getTestName())
                .notes(request.getNotes())
                .source(LabReport.ReportSource.HOSPITAL_LAB)
                .status(LabReport.ReportStatus.PENDING)
                .build();

        return labReportRepository.save(report);
    }

    // ── Upload report result (lab technician uploads) ─────────────────────
    public LabReport uploadReport(
            Long labReportId,
            String fileUrl,
            String notes) {

        LabReport report = labReportRepository
                .findById(labReportId)
                .orElseThrow(() ->
                    new RuntimeException("Lab report not found"));

        report.setReportFileUrl(fileUrl);
        report.setStatus(LabReport.ReportStatus.UPLOADED);

        if (notes != null) {
            report.setNotes(notes);
        }

        LabReport saved = labReportRepository.save(report);

        // Notify patient (console for now)
        System.out.println("====================================");
        System.out.println("LAB REPORT UPLOADED: "
            + report.getTestName()
            + " for patient: "
            + report.getPatient().getUser().getName());
        System.out.println("====================================");
        
     // Replace System.out.println with:
        notificationClient.sendLabReportReady(saved);

        return saved;
    }

    // ── Patient uploads external report ──────────────────────────────────
    public LabReport uploadExternalReport(
            Long userId,
            String testName,
            String fileUrl,
            String notes) {

        Patient patient = patientService
                .getOrCreatePatient(userId);

        LabReport report = LabReport.builder()
                .patient(patient)
                .testName(testName)
                .reportFileUrl(fileUrl)
                .notes(notes)
                .source(LabReport.ReportSource.EXTERNAL)
                .status(LabReport.ReportStatus.UPLOADED)
                .build();

        return labReportRepository.save(report);
    }

    // ── Get all lab reports for patient ──────────────────────────────────
    public List<LabReport> getPatientReports(Long userId) {
        Patient patient = patientService
                .getOrCreatePatient(userId);
        return labReportRepository
                .findByPatientPatientIdOrderByUploadDateDesc(
                        patient.getPatientId());
    }

    // ── Get pending orders for lab technician ────────────────────────────
    public List<LabReport> getPendingOrders() {
        return labReportRepository.findAll().stream()
                .filter(r -> r.getStatus()
                        == LabReport.ReportStatus.PENDING)
                .toList();
    }

    // ── Mark report as reviewed by doctor ────────────────────────────────
    public LabReport markReviewed(Long labReportId) {
        LabReport report = labReportRepository
                .findById(labReportId)
                .orElseThrow(() ->
                    new RuntimeException("Lab report not found"));

        report.setStatus(LabReport.ReportStatus.REVIEWED);
        return labReportRepository.save(report);
    }
}