package com.shms.service;

import com.shms.dto.AuthResponse;
import com.shms.dto.LoginRequest;
import com.shms.dto.OtpVerifyRequest;
import com.shms.dto.RegisterRequest;
import com.shms.dto.CreateStaffRequest;
import com.shms.model.User;
import com.shms.repository.UserRepository;
import com.shms.util.JwtUtil;
import com.shms.util.NotificationClient;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private NotificationClient notificationClient;
    
    
 // ── Create staff user (called by ADMIN or SUPER_ADMIN) ────────────────
    public AuthResponse createStaffUser(
            CreateStaffRequest request,
            User.Role createdByRole) {

        // ADMIN can only create DOCTOR, RECEPTIONIST, LAB_TECH
        // SUPER_ADMIN can also create ADMIN
        if (createdByRole == User.Role.ADMIN) {
            if (request.getRole() == User.Role.ADMIN
                    || request.getRole() == User.Role.SUPER_ADMIN
                    || request.getRole() == User.Role.PATIENT) {
                return AuthResponse.builder()
                        .success(false)
                        .message("ADMIN can only create: "
                            + "DOCTOR, RECEPTIONIST, LAB_TECH")
                        .build();
            }
        }

        if (createdByRole == User.Role.SUPER_ADMIN) {
            if (request.getRole() == User.Role.SUPER_ADMIN
                    || request.getRole() == User.Role.PATIENT) {
                return AuthResponse.builder()
                        .success(false)
                        .message("SUPER_ADMIN can only create: "
                            + "ADMIN, DOCTOR, RECEPTIONIST, LAB_TECH")
                        .build();
            }
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Email already registered.")
                    .build();
        }

        // Check if phone already exists
        if (userRepository.existsByPhone(request.getPhone())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Phone already registered.")
                    .build();
        }

        // Create user with the specified role
        // Staff accounts are pre-verified — no OTP needed
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(
                        request.getPassword()))
                .role(request.getRole())
                .isActive(true)
                .isVerified(true) // Staff verified by admin
                .languagePref(request.getLanguagePref())
                .build();

        User saved = userRepository.save(user);

        System.out.println("====================================");
        System.out.println("STAFF USER CREATED: "
            + saved.getEmail()
            + " | Role: " + saved.getRole());
        System.out.println("====================================");

        return AuthResponse.builder()
                .success(true)
                .userId(saved.getUserId())
                .role(saved.getRole().name())
                .name(saved.getName())
                .message(saved.getRole().name()
                    + " account created successfully.")
                .build();
    }

    // ── REGISTER ──────────────────────────────────────────────────────────
    public AuthResponse register(RegisterRequest request) {

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Email already registered. Please login.")
                    .build();
        }

        // Check if phone already exists
        if (userRepository.existsByPhone(request.getPhone())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Phone number already registered.")
                    .build();
        }

        // Build and save new user — auto-verified (no OTP required)
        User user = User.builder()
        		 .name(request.getName())
        	        .email(request.getEmail())
        	        .phone(request.getPhone())
        	        .passwordHash(passwordEncoder.encode(
        	                request.getPassword()))
        	        .role(User.Role.PATIENT) // Always PATIENT — never from client
        	        .isActive(true)
        	        .isVerified(true) // Auto-verified — OTP removed
        	        .languagePref(request.getLanguagePref())
        	        .build();

        userRepository.save(user);

        System.out.println("====================================");
        System.out.println("NEW PATIENT REGISTERED: " + request.getEmail());
        System.out.println("====================================");

        return AuthResponse.builder()
                .success(true)
                .message("Registration successful. You can now login.")
                .build();
    }

    // ── VERIFY REGISTRATION OTP ───────────────────────────────────────────
    public AuthResponse verifyRegistrationOtp(OtpVerifyRequest request) {

        // Find user by email
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());

        if (optionalUser.isEmpty()) {
            return AuthResponse.builder()
                    .success(false)
                    .message("User not found.")
                    .build();
        }

        User user = optionalUser.get();

        // Check if already verified
        if (user.getIsVerified()) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Account already verified. Please login.")
                    .build();
        }

        // Check OTP match
        if (!user.getOtpCode().equals(request.getOtp())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Invalid OTP. Please try again.")
                    .build();
        }

        // Check OTP expiry
        if (LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("OTP expired. Please register again.")
                    .build();
        }

        // Mark user as verified
        user.setIsVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        return AuthResponse.builder()
                .success(true)
                .message("Account verified successfully. You can now login.")
                .build();
    }

    // ── LOGIN STEP 1 — Verify password, send OTP ──────────────────────────
    public AuthResponse login(LoginRequest request) {

        // Find user by email
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());

        if (optionalUser.isEmpty()) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Invalid email or password.")
                    .build();
        }

        User user = optionalUser.get();

        // Check if account is verified
        if (!user.getIsVerified()) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Account not verified. Please verify your email first.")
                    .build();
        }

        // Check if account is active
        if (!user.getIsActive()) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Account deactivated. Contact administrator.")
                    .build();
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Invalid email or password.")
                    .build();
        }

        // Staff users (SUPER_ADMIN, ADMIN, DOCTOR, RECEPTIONIST, LAB_TECH) do not require OTP
        if (user.getRole() != User.Role.PATIENT) {
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            String token = jwtUtil.generateToken(user);
            return AuthResponse.builder()
                    .success(true)
                    .requiresOtp(false)
                    .token(token)
                    .role(user.getRole().name())
                    .name(user.getName())
                    .userId(user.getUserId())
                    .message("Login successful.")
                    .build();
        }

        // Patient — direct login, no OTP
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        String token = jwtUtil.generateToken(user);
        return AuthResponse.builder()
                .success(true)
                .requiresOtp(false)
                .token(token)
                .role(user.getRole().name())
                .name(user.getName())
                .userId(user.getUserId())
                .message("Login successful.")
                .build();
    }

    // ── LOGIN STEP 2 — Verify OTP, return JWT ────────────────────────────
    public AuthResponse verifyLoginOtp(OtpVerifyRequest request) {

        // Find user by email
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());

        if (optionalUser.isEmpty()) {
            return AuthResponse.builder()
                    .success(false)
                    .message("User not found.")
                    .build();
        }

        User user = optionalUser.get();

        // Check OTP match
        if (user.getOtpCode() == null || !user.getOtpCode().equals(request.getOtp())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Invalid OTP.")
                    .build();
        }

        // Check OTP expiry
        if (LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("OTP expired. Please login again.")
                    .build();
        }

        // Clear OTP after successful verification
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        // Generate JWT token
        String token = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .success(true)
                .token(token)
                .role(user.getRole().name())
                .name(user.getName())
                .userId(user.getUserId())
                .message("Login successful.")
                .build();
    }

    // ── HELPER — Generate 6-digit OTP ────────────────────────────────────
    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
    
 // ── FORGOT PASSWORD — send reset OTP ─────────────────────────────────
    public AuthResponse forgotPassword(String email) {

        Optional<User> optionalUser =
                userRepository.findByEmail(email);

        if (optionalUser.isEmpty()) {
            // Do not reveal if email exists
            return AuthResponse.builder()
                    .success(true)
                    .message(
                        "If this email is registered, " +
                        "a reset OTP has been sent.")
                    .build();
        }

        User user = optionalUser.get();
        String otp = generateOtp();
        user.setOtpCode(otp);
        user.setOtpExpiry(
                LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        // Send via .NET email service
        notificationClient.sendPasswordResetOtp(
                user, otp);

        System.out.println(
            "PASSWORD RESET OTP: " + otp +
            " for " + email);

        return AuthResponse.builder()
                .success(true)
                .message(
                    "Password reset OTP sent " +
                    "to your email.")
                .build();
    }

    // ── RESET PASSWORD ────────────────────────────────────────────────────
    public AuthResponse resetPassword(
            String email,
            String otp,
            String newPassword) {

        Optional<User> optionalUser =
                userRepository.findByEmail(email);

        if (optionalUser.isEmpty()) {
            return AuthResponse.builder()
                    .success(false)
                    .message("User not found.")
                    .build();
        }

        User user = optionalUser.get();

        if (user.getOtpCode() == null ||
                !user.getOtpCode().equals(otp)) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Invalid OTP.")
                    .build();
        }

        if (LocalDateTime.now()
                .isAfter(user.getOtpExpiry())) {
            return AuthResponse.builder()
                    .success(false)
                    .message(
                        "OTP expired. " +
                        "Request a new one.")
                    .build();
        }

        // Update password
        user.setPasswordHash(
                passwordEncoder.encode(newPassword));
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        return AuthResponse.builder()
                .success(true)
                .message(
                    "Password reset successfully. " +
                    "Please login.")
                .build();
    }
}