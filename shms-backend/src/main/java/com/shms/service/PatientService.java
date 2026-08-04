package com.shms.service;

import com.shms.dto.*;
import com.shms.model.*;
import com.shms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientMedicalHistoryRepository historyRepository;

    @Autowired
    private PatientAllergyRepository allergyRepository;

    @Autowired
    private PatientInsuranceRepository insuranceRepository;

    // ── GET OR CREATE PATIENT PROFILE ─────────────────────────────────────
    public Patient getOrCreatePatient(Long userId) {

        Optional<Patient> existing = patientRepository.findByUserUserId(userId);
        if (existing.isPresent()) {
            return existing.get();
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate registration number
        String regNumber = "SHMS-" + System.currentTimeMillis();

        Patient newPatient = Patient.builder()
                .user(user)
                .registrationNumber(regNumber)
                .build();

        return patientRepository.save(newPatient);
    }

    // ── UPDATE PATIENT PROFILE ────────────────────────────────────────────
//    public Patient updateProfile(Long userId, PatientProfileRequest request) {
//
//        Patient patient = getOrCreatePatient(userId);
//
//        patient.setDateOfBirth(request.getDateOfBirth());
//        patient.setGender(request.getGender());
//        patient.setBloodGroup(request.getBloodGroup());
//        patient.setAddress(request.getAddress());
//        patient.setCity(request.getCity());
//        patient.setPincode(request.getPincode());
//        patient.setEmergencyContactName(request.getEmergencyContactName());
//        patient.setEmergencyContactPhone(request.getEmergencyContactPhone());
//
//        return patientRepository.save(patient);
//    }
    
    public Patient updateProfile(
            Long userId,
			PatientProfileRequest request) {

		Patient patient = getOrCreatePatient(userId);

		if (request.getDateOfBirth() != null)
			patient.setDateOfBirth(request.getDateOfBirth());

		if (request.getGender() != null)
			patient.setGender(request.getGender());

		if (request.getBloodGroup() != null)
			patient.setBloodGroup(request.getBloodGroup());

		if (request.getAddress() != null)
			patient.setAddress(request.getAddress());

		if (request.getCity() != null)
			patient.setCity(request.getCity());

		if (request.getPincode() != null)
			patient.setPincode(request.getPincode());

		if (request.getEmergencyContactName() != null)
			patient.setEmergencyContactName(request.getEmergencyContactName());

		if (request.getEmergencyContactPhone() != null)
			patient.setEmergencyContactPhone(request.getEmergencyContactPhone());

		return patientRepository.save(patient);
	}

    // ── GET PATIENT PROFILE ───────────────────────────────────────────────
    public Patient getProfile(Long userId) {
        return getOrCreatePatient(userId);
    }

    // ── ADD MEDICAL HISTORY ───────────────────────────────────────────────
    public PatientMedicalHistory addMedicalHistory(
            Long userId, MedicalHistoryRequest request) {

        Patient patient = getOrCreatePatient(userId);

        PatientMedicalHistory history = PatientMedicalHistory.builder()
                .patient(patient)
                .conditionName(request.getConditionName())
                .diagnosedDate(request.getDiagnosedDate())
                .isChronic(request.getIsChronic())
                .notes(request.getNotes())
                .isActive(true)
                .build();

        return historyRepository.save(history);
    }

    // ── GET MEDICAL HISTORY ───────────────────────────────────────────────
    public List<PatientMedicalHistory> getMedicalHistory(Long userId) {
        Patient patient = getOrCreatePatient(userId);
        return historyRepository
                .findByPatientPatientIdAndIsActiveTrue(patient.getPatientId());
    }

    // ── ADD ALLERGY ───────────────────────────────────────────────────────
    public PatientAllergy addAllergy(Long userId, AllergyRequest request) {

        Patient patient = getOrCreatePatient(userId);

        PatientAllergy allergy = PatientAllergy.builder()
                .patient(patient)
                .allergen(request.getAllergen())
                .reaction(request.getReaction())
                .severity(request.getSeverity())
                .isDrugAllergy(request.getIsDrugAllergy())
                .build();

        return allergyRepository.save(allergy);
    }

    // ── GET ALLERGIES ─────────────────────────────────────────────────────
    public List<PatientAllergy> getAllergies(Long userId) {
        Patient patient = getOrCreatePatient(userId);
        return allergyRepository
                .findByPatientPatientId(patient.getPatientId());
    }

    // ── ADD INSURANCE ─────────────────────────────────────────────────────
    public PatientInsurance addInsurance(Long userId, InsuranceRequest request) {

        Patient patient = getOrCreatePatient(userId);

        PatientInsurance insurance = PatientInsurance.builder()
                .patient(patient)
                .providerName(request.getProviderName())
                .policyNumber(request.getPolicyNumber())
                .groupNumber(request.getGroupNumber())
                .sumInsured(request.getSumInsured())
                .validFrom(request.getValidFrom())
                .validUntil(request.getValidUntil())
                .coverageType(request.getCoverageType())
                .isActive(true)
                .build();

        return insuranceRepository.save(insurance);
    }

    // ── GET INSURANCE ─────────────────────────────────────────────────────
    public List<PatientInsurance> getInsurance(Long userId) {
        Patient patient = getOrCreatePatient(userId);
        return insuranceRepository
                .findByPatientPatientId(patient.getPatientId());
    }
}