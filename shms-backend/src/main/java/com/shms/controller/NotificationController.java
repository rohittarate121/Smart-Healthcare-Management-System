package com.shms.controller;

import com.shms.model.NotificationLog;
import com.shms.service.AdminService;
import com.shms.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private JwtUtil jwtUtil;

    private Long getUserId(HttpServletRequest request) {
        String token = request
                .getHeader("Authorization").substring(7);
        return jwtUtil.extractUserId(token);
    }

    // ── Get my unread notifications ───────────────────────────────────────
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationLog>> getUnread(
            HttpServletRequest request) {
        Long userId = getUserId(request);
        return ResponseEntity.ok(
                adminService.getUnreadNotifications(userId));
    }

    // ── Get all my notifications ──────────────────────────────────────────
    @GetMapping("/my")
    public ResponseEntity<List<NotificationLog>> getMy(
            HttpServletRequest request) {
        Long userId = getUserId(request);
        return ResponseEntity.ok(
                adminService.getUnreadNotifications(userId));
    }

    // ── Mark notification as read ─────────────────────────────────────────
    @PutMapping("/{notifId}/read")
    public ResponseEntity<NotificationLog> markRead(
            @PathVariable Long notifId) {
        return ResponseEntity.ok(
                adminService.markAsRead(notifId));
    }
}