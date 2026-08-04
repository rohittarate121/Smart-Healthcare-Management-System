package com.shms.service;

import com.shms.dto.PrescriptionRequestDTO;
import com.shms.dto.PrescriptionResponseDTO;
import com.shms.model.*;
import com.shms.repository.*;
import com.shms.util.NotificationClient;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PrescriptionService {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private PrescriptionItemRepository itemRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientAllergyRepository allergyRepository;

    @Autowired
    private DoctorService doctorService;
    
    @Autowired
    private NotificationClient notificationClient;

    // ── DRUG ALLERGY CHECK ────────────────────────────────────────────────
    // This is the patient safety feature
    // Checks every medicine against patient's drug allergies
    private List<String> checkAllergyConflicts(
            Long patientId,
            List<PrescriptionRequestDTO.MedicineItemDTO> medicines) {

        List<String> warnings = new ArrayList<>();

        // Get only drug allergies for this patient
        List<PatientAllergy> drugAllergies = allergyRepository
                .findByPatientPatientIdAndIsDrugAllergyTrue(patientId);

        if (drugAllergies.isEmpty()) return warnings;

        for (PrescriptionRequestDTO.MedicineItemDTO medicine
                : medicines) {

            String medicineLower =
                    medicine.getMedicineName().toLowerCase();

            for (PatientAllergy allergy : drugAllergies) {

                String allergenLower =
                        allergy.getAllergen().toLowerCase();

                // Check if medicine name contains allergen
                // or allergen contains medicine name
                if (medicineLower.contains(allergenLower)
                        || allergenLower.contains(medicineLower)) {

                    warnings.add(
                        "WARNING: "
                        + medicine.getMedicineName()
                        + " may conflict with known allergy to "
                        + allergy.getAllergen()
                        + " (Severity: "
                        + allergy.getSeverity()
                        + ")"
                    );
                }
            }
        }

        return warnings;
    }

    // ── CREATE PRESCRIPTION ───────────────────────────────────────────────
    @Transactional
    public PrescriptionResponseDTO create(
            Long doctorUserId,
            PrescriptionRequestDTO request) {

        // Get appointment
        Appointment appointment = appointmentRepository
                .findById(request.getApptId())
                .orElseThrow(() ->
                    new RuntimeException(
                        "Appointment not found"));

        Patient patient = appointment.getPatient();
        Doctor doctor = doctorService
                .getDoctorByUserId(doctorUserId);

        // Run allergy check BEFORE saving
        List<String> allergyWarnings = checkAllergyConflicts(
                patient.getPatientId(),
                request.getMedicines());

        // Build prescription
        Prescription prescription = Prescription.builder()
                .appointment(appointment)
                .patient(patient)
                .doctor(doctor)
                .diagnosis(request.getDiagnosis())
                .advice(request.getAdvice())
                .followUpDate(request.getFollowUpDate())
                .build();

        Prescription saved =
                prescriptionRepository.save(prescription);

        // Save each medicine item
        List<PrescriptionItem> savedItems = new ArrayList<>();
        List<PrescriptionResponseDTO.MedicineItemResponse>
                itemResponses = new ArrayList<>();

        for (PrescriptionRequestDTO.MedicineItemDTO med
                : request.getMedicines()) {

            // Check if this specific medicine is flagged
            boolean flagged = allergyWarnings.stream()
                    .anyMatch(w -> w.contains(med.getMedicineName()));

            PrescriptionItem item = PrescriptionItem.builder()
                    .prescription(saved)
                    .medicineName(med.getMedicineName())
                    .dosage(med.getDosage())
                    .frequency(med.getFrequency())
                    .durationDays(med.getDurationDays())
                    .instructions(med.getInstructions())
                    .isAllergyFlagged(flagged)
                    .build();

            PrescriptionItem savedItem =
                    itemRepository.save(item);
            savedItems.add(savedItem);

            itemResponses.add(
                PrescriptionResponseDTO.MedicineItemResponse
                    .builder()
                    .itemId(savedItem.getItemId())
                    .medicineName(savedItem.getMedicineName())
                    .dosage(savedItem.getDosage())
                    .frequency(savedItem.getFrequency())
                    .durationDays(savedItem.getDurationDays())
                    .instructions(savedItem.getInstructions())
                    .isAllergyFlagged(savedItem.getIsAllergyFlagged())
                    .build()
            );
        }

//         Print to console (notification service added later)
        System.out.println("====================================");
        System.out.println("PRESCRIPTION ISSUED for: "
            + patient.getUser().getName());
        if (!allergyWarnings.isEmpty()) {
            System.out.println("ALLERGY WARNINGS DETECTED:");
            allergyWarnings.forEach(System.out::println);
        }
        System.out.println("====================================");
        
     // Replace System.out.println with:
        notificationClient.sendPrescriptionIssued(saved);

        return PrescriptionResponseDTO.builder()
                .prescriptionId(saved.getPrescriptionId())
                .apptId(appointment.getApptId())
                .patientName(patient.getUser().getName())
                .doctorName(doctor.getUser().getName())
                .diagnosis(saved.getDiagnosis())
                .advice(saved.getAdvice())
                .followUpDate(saved.getFollowUpDate())
                .issuedAt(saved.getIssuedAt())
                .medicines(itemResponses)
                .allergyWarnings(allergyWarnings)
                .hasAllergyConflict(!allergyWarnings.isEmpty())
                .build();
    }

    // ── GET PRESCRIPTIONS FOR PATIENT ─────────────────────────────────────
    public List<Prescription> getPatientPrescriptions(
            Long patientId) {
        return prescriptionRepository
                .findByPatientPatientId(patientId);
    }

    // ── GET PRESCRIPTIONS BY APPOINTMENT ──────────────────────────────────
    public Prescription getByAppointment(Long apptId) {
        return prescriptionRepository
                .findByAppointmentApptId(apptId)
                .orElseThrow(() ->
                    new RuntimeException(
                        "Prescription not found for "
                        + "this appointment"));
    }
}