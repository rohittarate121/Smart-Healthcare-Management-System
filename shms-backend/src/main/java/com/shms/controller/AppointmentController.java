package com.shms.controller;

import com.shms.dto.BookingRequestDTO;
import com.shms.dto.CompleteAppointmentDTO;
import com.shms.model.Appointment;
import com.shms.service.AppointmentService;
import com.shms.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private JwtUtil jwtUtil;

    private Long getUserId(HttpServletRequest request) {
        String token = request
                .getHeader("Authorization").substring(7);
        return jwtUtil.extractUserId(token);
    }

    // ── Book appointment ──────────────────────────────────────────────────
    @PostMapping("/book")
    public ResponseEntity<Appointment> book(
            HttpServletRequest request,
            @RequestBody BookingRequestDTO bookingRequest) {
        Long userId = getUserId(request);
        Appointment appointment =
                appointmentService.book(userId, bookingRequest);
        return ResponseEntity.ok(appointment);
    }

    // ── Cancel appointment ────────────────────────────────────────────────
    @PutMapping("/{apptId}/cancel")
    public ResponseEntity<Appointment> cancel(
            @PathVariable Long apptId,
            @RequestParam(required = false)
            String reason) {
        Appointment appointment =
                appointmentService.cancel(apptId, reason);
        return ResponseEntity.ok(appointment);
    }

    // ── Check in patient ──────────────────────────────────────────────────
    @PutMapping("/{apptId}/checkin")
    public ResponseEntity<Appointment> checkIn(
            @PathVariable Long apptId) {
        Appointment appointment =
                appointmentService.checkIn(apptId);
        return ResponseEntity.ok(appointment);
    }

    // ── Complete appointment ──────────────────────────────────────────────
    @PutMapping("/{apptId}/complete")
    public ResponseEntity<Appointment> complete(
            @PathVariable Long apptId,
            @RequestBody CompleteAppointmentDTO dto) {
        Appointment appointment =
                appointmentService.complete(apptId, dto);
        return ResponseEntity.ok(appointment);
    }

    // ── Get my appointments (patient) ─────────────────────────────────────
    @GetMapping("/my")
    public ResponseEntity<List<Appointment>> getMyAppointments(
            HttpServletRequest request) {
        Long userId = getUserId(request);
        List<Appointment> appointments =
                appointmentService.getPatientAppointments(userId);
        return ResponseEntity.ok(appointments);
    }

    // ── Get my schedule (doctor) ──────────────────────────────────────────
    @GetMapping("/doctor-schedule")
    public ResponseEntity<List<Appointment>> getDoctorSchedule(
            HttpServletRequest request) {
        Long userId = getUserId(request);
        List<Appointment> appointments =
                appointmentService.getDoctorAppointments(userId);
        return ResponseEntity.ok(appointments);
    }
}