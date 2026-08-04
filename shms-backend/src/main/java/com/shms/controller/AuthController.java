package com.shms.controller;

import com.shms.dto.AuthResponse;
import com.shms.dto.CreateStaffRequest;
import com.shms.dto.ForgotPasswordRequest;
import com.shms.dto.LoginRequest;
import com.shms.dto.OtpVerifyRequest;
import com.shms.dto.RegisterRequest;
import com.shms.dto.ResetPasswordRequest;
import com.shms.util.JwtUtil;
import com.shms.model.Patient;
import com.shms.model.User;
import com.shms.repository.PatientRepository;
import com.shms.repository.UserRepository;
import com.shms.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;


@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;


    // ── REGISTER ──────────────────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        AuthResponse response = authService.register(request);

        if (!response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ── VERIFY REGISTRATION OTP ───────────────────────────────────────────
    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(
            @Valid @RequestBody OtpVerifyRequest request) {

        AuthResponse response = authService.verifyRegistrationOtp(request);

        if (!response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        return ResponseEntity.ok(response);
    }
    
 // ── ADMIN creates staff (DOCTOR, RECEPTIONIST, LAB_TECH) ─────────────
    @PostMapping("/admin/create-staff")
    public ResponseEntity<AuthResponse> createStaff(
            HttpServletRequest request,
            @Valid @RequestBody CreateStaffRequest staffRequest) {

        // Get the role of who is making this request
        String token = request.getHeader("Authorization")
                .substring(7);
        String callerRole = jwtUtil.extractRole(token);

        User.Role callerRoleEnum =
                User.Role.valueOf(callerRole);

        AuthResponse response = authService
                .createStaffUser(staffRequest, callerRoleEnum);

        if (!response.isSuccess()) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(response);
        }

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // ── LOGIN STEP 1 — Password verification ──────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse response = authService.login(request);

        if (!response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        return ResponseEntity.ok(response);
    }

    // ── LOGIN STEP 2 — OTP verification, returns JWT ──────────────────────
    @PostMapping("/login/verify-otp")
    public ResponseEntity<AuthResponse> verifyLoginOtp(
            @Valid @RequestBody OtpVerifyRequest request) {

        AuthResponse response = authService.verifyLoginOtp(request);

        if (!response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        return ResponseEntity.ok(response);
    }
    
 // ── Receptionist registers walk-in patient ────────────────────────────
    @PostMapping("/register-walkin")
    public ResponseEntity<AuthResponse> registerWalkIn(
            @RequestBody @Valid RegisterRequest request) {

        // Check if already exists
        if (userRepository.existsByEmail(
                request.getEmail())) {
            // Return existing user info
            User existing = userRepository
                    .findByEmail(request.getEmail())
                    .orElseThrow();
            return ResponseEntity.ok(
                AuthResponse.builder()
                    .success(true)
                    .userId(existing.getUserId())
                    .name(existing.getName())
                    .role(existing.getRole().name())
                    .message("Existing patient found.")
                    .build()
            );
        }

        // Register new patient — pre-verified
        // No OTP needed for walk-in registration
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder
                    .encode(request.getPassword()))
                .role(User.Role.PATIENT)
                .isActive(true)
                .isVerified(true) // pre-verified by receptionist
                .languagePref("EN")
                .build();

        User saved = userRepository.save(user);

        // Auto-create patient profile
        Patient patient = Patient.builder()
                .user(saved)
                .registrationNumber(
                    "SHMS-" + System.currentTimeMillis())
                .build();

        patientRepository.save(patient);

        System.out.println(
            "====================================");
        System.out.println(
            "WALK-IN PATIENT REGISTERED: "
            + saved.getName()
            + " | " + saved.getEmail());
        System.out.println(
            "====================================");

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(AuthResponse.builder()
                    .success(true)
                    .userId(saved.getUserId())
                    .name(saved.getName())
                    .role("PATIENT")
                    .message(
                        "Walk-in patient registered.")
                    .build());
    }
    
 // ── FORGOT PASSWORD ───────────────────────────────────────────────────
    @PostMapping("/forgot-password")
    public ResponseEntity<AuthResponse> forgotPassword(
            @Valid @RequestBody
            ForgotPasswordRequest request) {
        AuthResponse response =
                authService.forgotPassword(
                    request.getEmail());
        return ResponseEntity.ok(response);
    }

    // ── RESET PASSWORD ────────────────────────────────────────────────────
    @PostMapping("/reset-password")
    public ResponseEntity<AuthResponse> resetPassword(
            @Valid @RequestBody
            ResetPasswordRequest request) {
        AuthResponse response =
                authService.resetPassword(
                    request.getEmail(),
                    request.getOtp(),
                    request.getNewPassword());

        if (!response.isSuccess()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(response);
        }

        return ResponseEntity.ok(response);
    }

    // ── HEALTH CHECK — Test endpoint ──────────────────────────────────────
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("SHMS Auth Service is running.");
    }
}