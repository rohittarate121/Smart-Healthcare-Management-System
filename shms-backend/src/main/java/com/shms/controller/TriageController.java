package com.shms.controller;

import com.shms.dto.SymptomInputDTO;
import com.shms.dto.TriageResponseDTO;
import com.shms.model.TriageReport;
import com.shms.service.TriageService;
import com.shms.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/triage")
public class TriageController {

    @Autowired
    private TriageService triageService;

    @Autowired
    private JwtUtil jwtUtil;

    private Long getUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtUtil.extractUserId(token);
    }

    // ── Analyse symptoms ──────────────────────────────────────────────────
    @PostMapping("/analyse")
    public ResponseEntity<TriageResponseDTO> analyse(
            HttpServletRequest request,
            @RequestBody SymptomInputDTO input) {

        Long userId = getUserId(request);
        TriageResponseDTO response = triageService.analyse(userId, input);
        return ResponseEntity.ok(response);
    }

    // ── Get triage history ────────────────────────────────────────────────
    @GetMapping("/history")
    public ResponseEntity<List<TriageReport>> getHistory(
            HttpServletRequest request) {

        Long userId = getUserId(request);
        List<TriageReport> history = triageService.getHistory(userId);
        return ResponseEntity.ok(history);
    }
}