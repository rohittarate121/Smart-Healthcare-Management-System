package com.shms.controller;

import com.shms.dto.CreateDoctorProfileDTO;
import com.shms.dto.SlotRequestDTO;
import com.shms.model.Doctor;
import com.shms.model.DoctorAvailability;
import com.shms.repository.DoctorAvailabilityRepository;
import com.shms.service.DoctorService;
import com.shms.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private DoctorAvailabilityRepository
            availabilityRepository;

    private Long getUserId(HttpServletRequest request) {
        String token = request
                .getHeader("Authorization").substring(7);
        return jwtUtil.extractUserId(token);
    }

    // ── Get all doctors ───────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    // ── Filter by specialty ───────────────────────────────────────────────
    @GetMapping("/by-specialty")
    public ResponseEntity<List<Doctor>> getBySpecialty(
            @RequestParam String specialty) {
        return ResponseEntity.ok(
                doctorService.getBySpecialty(specialty));
    }

    // ── Get doctor by ID ──────────────────────────────────────────────────
    @GetMapping("/{doctorId}")
    public ResponseEntity<Doctor> getDoctorById(
            @PathVariable Long doctorId) {
        return ResponseEntity.ok(
                doctorService.getDoctorById(doctorId));
    }

    // ── Get available slots ───────────────────────────────────────────────
    @GetMapping("/{doctorId}/slots")
    public ResponseEntity<List<DoctorAvailability>> getSlots(
            @PathVariable Long doctorId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date) {
        return ResponseEntity.ok(
                doctorService.getAvailableSlots(doctorId, date));
    }
 // ── Create own doctor profile ─────────────────────────────────────────
    @PostMapping("/profile")
    public ResponseEntity<Doctor> createProfile(
            HttpServletRequest request,
            @RequestBody CreateDoctorProfileDTO dto) {
        Long userId = getUserId(request);
        Doctor doctor = doctorService
                .createDoctorProfile(userId, dto);
        return ResponseEntity.ok(doctor);
    }

    // ── Add slot (doctor adds their own availability) ─────────────────────
    @PostMapping("/slots")
    public ResponseEntity<DoctorAvailability> addSlot(
            HttpServletRequest request,
            @RequestBody SlotRequestDTO slotRequest) {
        Long userId = getUserId(request);
        Doctor doctor = doctorService.getDoctorByUserId(userId);
        DoctorAvailability slot = doctorService
                .addSlot(doctor.getDoctorId(), slotRequest);
        return ResponseEntity.ok(slot);
    }
    
 // ── Doctor views own availability slots ───────────────────────────────
    @GetMapping("/my-slots")
    public ResponseEntity<List<DoctorAvailability>>
            getMySlots(HttpServletRequest request) {
        Long userId = getUserId(request);
        Doctor doctor = doctorService
                .getDoctorByUserId(userId);
        List<DoctorAvailability> slots =
                availabilityRepository
                    .findByDoctorDoctorId(
                        doctor.getDoctorId());
        return ResponseEntity.ok(slots);
    }
}