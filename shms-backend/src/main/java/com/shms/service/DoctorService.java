package com.shms.service;

import com.shms.dto.CreateDoctorProfileDTO;
import com.shms.dto.SlotRequestDTO;
import com.shms.model.Doctor;
import com.shms.model.DoctorAvailability;
import com.shms.model.User;
import com.shms.repository.DoctorAvailabilityRepository;
import com.shms.repository.DoctorRepository;
import com.shms.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private DoctorAvailabilityRepository availabilityRepository;
    
    @Autowired
    private UserRepository userRepository;
    
 // ── Create doctor profile ─────────────────────────────────────────────
    public Doctor createDoctorProfile(
            Long userId,
            CreateDoctorProfileDTO request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                    new RuntimeException("User not found"));

        // Check if doctor profile already exists
        if (doctorRepository.findByUserUserId(userId).isPresent()) {
            throw new RuntimeException(
                "Doctor profile already exists");
        }

        Doctor doctor = Doctor.builder()
                .user(user)
                .specialization(request.getSpecialization())
                .qualification(request.getQualification())
                .experienceYears(request.getExperienceYears())
                .registrationNo(request.getRegistrationNo())
                .consultationFee(request.getConsultationFee())
                .bio(request.getBio())
                .isAvailable(true)
                .build();

        return doctorRepository.save(doctor);
    }

    // ── Get all doctors ───────────────────────────────────────────────────
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findByIsAvailableTrue();
    }

    // ── Get doctor by ID ──────────────────────────────────────────────────
    public Doctor getDoctorById(Long doctorId) {
        return doctorRepository.findById(doctorId)
                .orElseThrow(() ->
                    new RuntimeException("Doctor not found"));
    }

    // ── Filter by specialty ───────────────────────────────────────────────
    public List<Doctor> getBySpecialty(String specialty) {
        return doctorRepository
                .findBySpecializationContainingIgnoreCase(specialty);
    }

    // ── Get available slots for doctor on date ────────────────────────────
    public List<DoctorAvailability> getAvailableSlots(
            Long doctorId, LocalDate date) {

        if (date != null) {
            return availabilityRepository
                .findByDoctorDoctorIdAndSlotDateAndIsBookedFalse(
                    doctorId, date);
        }
        return availabilityRepository
                .findByDoctorDoctorIdAndIsBookedFalse(doctorId);
    }

    // ── Add slot for doctor ───────────────────────────────────────────────
    public DoctorAvailability addSlot(
            Long doctorId, SlotRequestDTO request) {

        Doctor doctor = getDoctorById(doctorId);

        DoctorAvailability slot = DoctorAvailability.builder()
                .doctor(doctor)
                .slotDate(request.getSlotDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .isBooked(false)
                .build();

        return availabilityRepository.save(slot);
    }

    // ── Get doctor by userId ──────────────────────────────────────────────
    public Doctor getDoctorByUserId(Long userId) {
        return doctorRepository.findByUserUserId(userId)
                .orElseThrow(() ->
                    new RuntimeException("Doctor profile not found"));
    }
}