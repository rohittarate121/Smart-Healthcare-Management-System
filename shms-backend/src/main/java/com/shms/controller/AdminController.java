package com.shms.controller;

import com.shms.dto.DashboardStatsDTO;
import com.shms.dto.UserStatusUpdateDTO;
import com.shms.model.*;
import com.shms.repository.UserRepository;
import com.shms.service.AdminService;
import com.shms.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserRepository userRepository;

    private Long getUserId(HttpServletRequest request) {
        String token = request
                .getHeader("Authorization").substring(7);
        return jwtUtil.extractUserId(token);
    }

    // ── Dashboard ─────────────────────────────────────────────────────────
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsDTO> getDashboard() {
        return ResponseEntity.ok(
                adminService.getDashboardStats());
    }

    // ── Revenue analytics ─────────────────────────────────────────────────
    @GetMapping("/analytics/revenue")
    public ResponseEntity<Map<String, Double>> getRevenue() {
        return ResponseEntity.ok(
                adminService.getRevenueByType());
    }

    // ── All users ─────────────────────────────────────────────────────────
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(
                adminService.getAllUsers());
    }

    // ── Users by role ─────────────────────────────────────────────────────
    @GetMapping("/users/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(
            @PathVariable String role) {
        User.Role userRole = User.Role.valueOf(
                role.toUpperCase());
        return ResponseEntity.ok(
                adminService.getUsersByRole(userRole));
    }

    // ── Activate or deactivate user ───────────────────────────────────────
    @PutMapping("/users/{userId}/status")
    public ResponseEntity<User> updateUserStatus(
            @PathVariable Long userId,
            @RequestBody UserStatusUpdateDTO dto) {
        return ResponseEntity.ok(
                adminService.updateUserStatus(userId, dto));
    }

    // ── All doctors ───────────────────────────────────────────────────────
    @GetMapping("/doctors")
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(
                adminService.getAllDoctors());
    }

    // ── All patients ──────────────────────────────────────────────────────
    @GetMapping("/patients")
    public ResponseEntity<List<Patient>> getAllPatients() {
        return ResponseEntity.ok(
                adminService.getAllPatients());
    }

    // ── All appointments ──────────────────────────────────────────────────
    @GetMapping("/appointments")
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        return ResponseEntity.ok(
                adminService.getAllAppointments());
    }

    // ── All notification logs ─────────────────────────────────────────────
    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationLog>> getNotifications() {
        return ResponseEntity.ok(
                adminService.getAllNotifications());
    }
    
 // ── Search patient by name or phone ──────────────────────────────────
    @GetMapping("/patients/search")
    public ResponseEntity<List<User>> searchPatients(
            @RequestParam(required = false,
                           defaultValue = "")
            String query) {
        List<User> all = userRepository.findAll();

        // If empty query return all patients
        if (query.trim().isEmpty()) {
            List<User> patients = all.stream()
                    .filter(u ->
                        u.getRole() == User.Role.PATIENT)
                    .toList();
            return ResponseEntity.ok(patients);
        }

        String q = query.toLowerCase();
        List<User> filtered = all.stream()
                .filter(u ->
                    u.getRole() == User.Role.PATIENT &&
                    (u.getName().toLowerCase()
                        .contains(q) ||
                    u.getPhone().contains(q) ||
                    u.getEmail().toLowerCase()
                        .contains(q)))
                .toList();
        return ResponseEntity.ok(filtered);
    }
}