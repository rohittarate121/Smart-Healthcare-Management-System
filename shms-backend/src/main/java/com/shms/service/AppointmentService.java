package com.shms.service;

import com.shms.dto.BookingRequestDTO;
import com.shms.dto.CompleteAppointmentDTO;
import com.shms.model.*;
import com.shms.repository.*;
import com.shms.util.NotificationClient;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorAvailabilityRepository availabilityRepository;

    @Autowired
    private TriageReportRepository triageReportRepository;

    @Autowired
    private PatientService patientService;

    @Autowired
    private DoctorService doctorService;
    
    @Autowired
    private NotificationClient notificationClient;

    // ── Book appointment — @Transactional prevents double booking ─────────
    @Transactional
    public Appointment book(Long userId, BookingRequestDTO request) {

    	 System.out.println("Entered AppointmentService.book()");
        // Get patient
        Patient patient = patientService.getOrCreatePatient(userId);

        // Get doctor
        Doctor doctor = doctorService.getDoctorById(
                request.getDoctorId());

        // Get and lock the slot — check it is still available
        DoctorAvailability slot = availabilityRepository
                .findByAvailIdAndIsBookedFalse(request.getAvailId())
                .orElseThrow(() -> new RuntimeException(
                    "Slot not available or already booked."));

        // Mark slot as booked
        slot.setIsBooked(true);
        availabilityRepository.save(slot);

        // Get triage report if provided
        TriageReport triageReport = null;
        if (request.getTriageReportId() != null) {
            triageReport = triageReportRepository
                    .findById(request.getTriageReportId())
                    .orElse(null);
        }

        // Create appointment
        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .slot(slot)
                .triageReport(triageReport)
                .apptType(request.getApptType() != null
                    ? request.getApptType()
                    : Appointment.AppointmentType.OPD)
                .status(Appointment.AppointmentStatus.CONFIRMED)
                .build();

        Appointment saved = appointmentRepository.save(appointment);

        // Print for now — .NET notification will be added in Milestone 6
        System.out.println("====================================");
        System.out.println("APPOINTMENT CONFIRMED: "
            + patient.getUser().getName()
            + " with Dr. "
            + doctor.getUser().getName()
            + " on " + slot.getSlotDate()
            + " at " + slot.getStartTime());
        System.out.println("====================================");
        
     // Replace the System.out.println block with:
        notificationClient.sendAppointmentConfirmation(saved);

        return saved;
    }

    // ── Cancel appointment ────────────────────────────────────────────────
    @Transactional
    public Appointment cancel(Long apptId, String reason) {

        Appointment appointment = appointmentRepository
                .findById(apptId)
                .orElseThrow(() ->
                    new RuntimeException("Appointment not found"));

        appointment.setStatus(
                Appointment.AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(reason);

        // Free the slot
        if (appointment.getSlot() != null) {
            DoctorAvailability slot = appointment.getSlot();
            slot.setIsBooked(false);
            availabilityRepository.save(slot);
        }

        return appointmentRepository.save(appointment);
    }

    // ── Check in patient ──────────────────────────────────────────────────
    public Appointment checkIn(Long apptId) {

        Appointment appointment = appointmentRepository
                .findById(apptId)
                .orElseThrow(() ->
                    new RuntimeException("Appointment not found"));

        appointment.setStatus(
                Appointment.AppointmentStatus.CHECKED_IN);

        return appointmentRepository.save(appointment);
    }

    // ── Complete appointment — doctor fills notes and diagnosis ───────────
    public Appointment complete(
            Long apptId, CompleteAppointmentDTO dto) {

        Appointment appointment = appointmentRepository
                .findById(apptId)
                .orElseThrow(() ->
                    new RuntimeException("Appointment not found"));

        appointment.setConsultationNotes(dto.getConsultationNotes());
        appointment.setDiagnosis(dto.getDiagnosis());
        appointment.setFollowUpDate(dto.getFollowUpDate());
        appointment.setStatus(
                Appointment.AppointmentStatus.COMPLETED);

        return appointmentRepository.save(appointment);
    }

    // ── Get patient appointments ──────────────────────────────────────────
    public List<Appointment> getPatientAppointments(Long userId) {
        Patient patient = patientService.getOrCreatePatient(userId);
        return appointmentRepository
                .findByPatientPatientIdOrderByCreatedAtDesc(
                        patient.getPatientId());
    }

    // ── Get doctor appointments ───────────────────────────────────────────
    public List<Appointment> getDoctorAppointments(Long userId) {
        Doctor doctor = doctorService.getDoctorByUserId(userId);
        return appointmentRepository
                .findByDoctorDoctorId(doctor.getDoctorId());
    }
}