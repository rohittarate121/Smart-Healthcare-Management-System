//package com.shms.config;
//
//import com.shms.util.JwtFilter;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
//import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.config.http.SessionCreationPolicy;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.web.SecurityFilterChain;
//import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
//import org.springframework.web.cors.CorsConfiguration;
//import org.springframework.web.cors.CorsConfigurationSource;
//import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
//import org.springframework.security.web.AuthenticationEntryPoint;
//import java.io.IOException;
//import jakarta.servlet.http.HttpServletResponse;
//import java.time.LocalDateTime;
//
//import java.util.List;
//
//@Configuration
//@EnableWebSecurity
//@EnableMethodSecurity
//public class SecurityConfig {
//
//    @Autowired
//    private JwtFilter jwtFilter;
//
//    // ── Password Encoder Bean ─────────────────────────────────────────────
//    @Bean
//    public PasswordEncoder passwordEncoder() {
//        return new BCryptPasswordEncoder(12);
//    }
//
//    // ── Authentication Manager Bean ───────────────────────────────────────
//    @Bean
//    public AuthenticationManager authenticationManager(
//            AuthenticationConfiguration config) throws Exception {
//        return config.getAuthenticationManager();
//    }
//
//    // ── Main Security Filter Chain ────────────────────────────────────────
//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//
//        http
//            // Disable CSRF - not needed for REST APIs with JWT
//            .csrf(csrf -> csrf.disable())
//
//            // Configure CORS
//            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
//
//            // Configure which endpoints need auth
//            .authorizeHttpRequests(auth -> auth
//
//                // Public endpoints - no token needed
//                .requestMatchers(
//                    "/api/auth/**"
//                ).permitAll()
//
//                // All other endpoints require authentication
//                .anyRequest().authenticated()
//            )
//
//            // Use stateless sessions - no server-side session storage
//            .sessionManagement(session -> session
//                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
//            )
//
//            // Add JwtFilter before Spring's default login filter
//            .addFilterBefore(jwtFilter,
//                UsernamePasswordAuthenticationFilter.class)
//        
//            	.exceptionHandling(ex -> ex
//            			.authenticationEntryPoint(authenticationEntryPoint())
//            			);
//
//        return http.build();
//    }
//
//    // ── CORS Configuration ────────────────────────────────────────────────
//    @Bean
//    public CorsConfigurationSource corsConfigurationSource() {
//        CorsConfiguration configuration = new CorsConfiguration();
//
//        // Allow React frontend
//        configuration.setAllowedOrigins(List.of(
//            "http://localhost:3000"
//        ));
//
//        // Allow these HTTP methods
//        configuration.setAllowedMethods(List.of(
//            "GET", "POST", "PUT", "DELETE", "OPTIONS"
//        ));
//
//        // Allow these headers
//        configuration.setAllowedHeaders(List.of(
//            "Authorization",
//            "Content-Type",
//            "Accept"
//        ));
//
//        // Allow credentials
//        configuration.setAllowCredentials(true);
//
//        // Apply to all paths
//        UrlBasedCorsConfigurationSource source =
//            new UrlBasedCorsConfigurationSource();
//        source.registerCorsConfiguration("/**", configuration);
//
//        return source;
//    }
//    @Bean
//    public AuthenticationEntryPoint authenticationEntryPoint() {
//        return (request, response, authException) -> {
//            response.setContentType("application/json");
//            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
//            response.getWriter().write(
//                "{\"status\":401,"
//                + "\"error\":\"Unauthorized\","
//                + "\"message\":\"No valid JWT token provided.\","
//                + "\"timestamp\":\""
//                + LocalDateTime.now() + "\"}"
//            );
//        };
//    }
//}


package com.shms.config;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.shms.util.JwtFilter;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
//import tools.jackson.databind.ObjectMapper;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    // ── Password Encoder ──────────────────────────────────────────────────
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    // ── Authentication Manager ────────────────────────────────────────────
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    // ── 401 Handler — unauthenticated requests ────────────────────────────
    @Bean
    public AuthenticationEntryPoint authenticationEntryPoint() {
        return (request, response, authException) -> {
            response.setContentType(
                    MediaType.APPLICATION_JSON_VALUE);
            response.setStatus(
                    HttpServletResponse.SC_UNAUTHORIZED);

            Map<String, Object> body = new HashMap<>();
            body.put("status", 401);
            body.put("error", "Unauthorized");
            body.put("message",
                "No valid JWT token. Please login.");
            body.put("path",
                request.getRequestURI());
            body.put("timestamp",
                LocalDateTime.now().toString());

            new ObjectMapper().writeValue(
                    response.getOutputStream(), body);
        };
    }

    // ── 403 Handler — authenticated but wrong role ────────────────────────
    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        return (request, response, accessDeniedException) -> {
            response.setContentType(
                    MediaType.APPLICATION_JSON_VALUE);
            response.setStatus(
                    HttpServletResponse.SC_FORBIDDEN);

            Map<String, Object> body = new HashMap<>();
            body.put("status", 403);
            body.put("error", "Forbidden");
            body.put("message",
                "You do not have permission "
                + "to access this resource.");
            body.put("path",
                request.getRequestURI());
            body.put("timestamp",
                LocalDateTime.now().toString());

            new ObjectMapper().writeValue(
                    response.getOutputStream(), body);
        };
    }

    // ── Main Security Filter Chain ────────────────────────────────────────
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors
                .configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session
                .sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests(auth -> auth

                // ── PUBLIC — no token needed ──────────────────────────
                .requestMatchers(
                    "/api/auth/register",
                    "/api/auth/verify-otp",
                    "/api/auth/login",
                    "/api/auth/login/verify-otp",
                    "/api/auth/forgot-password",
                    "/api/auth/reset-password",
                    "/api/auth/health",
                    

                    // Swagger
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**"
                    
                ).permitAll()

                // ── SUPER_ADMIN only ──────────────────────────────────
                .requestMatchers(
                    "/api/super-admin/**"
                ).hasRole("SUPER_ADMIN")

                // ── ADMIN and SUPER_ADMIN ─────────────────────────────
                .requestMatchers(
                    "/api/admin/**",
                    "/api/billing/admit",
                    "/api/billing/admissions/**",
                    "/api/billing/claims/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN")

                // ── Staff creation — ADMIN and SUPER_ADMIN ────────────
                .requestMatchers(
                    "/api/auth/admin/create-staff"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN")

                // ── DOCTOR only ───────────────────────────────────────
                .requestMatchers(
                    "/api/prescriptions",
                    "/api/lab-reports/order",
                    "/api/lab-reports/*/reviewed",
                    "/api/appointments/*/complete",
                    "/api/appointments/doctor-schedule"
                ).hasRole("DOCTOR")
                
             // ── Doctor reads specific patient data ───────────────────────────────
                .requestMatchers(
                    "/api/patients/profile/*",
                    "/api/patients/*/allergies",
                    "/api/patients/*/medical-history"
                ).hasAnyRole("DOCTOR", "ADMIN", "SUPER_ADMIN")

                // ── RECEPTIONIST only ─────────────────────────────────
                .requestMatchers(
                    "/api/appointments/*/checkin"
                ).hasAnyRole("RECEPTIONIST", "ADMIN",
                             "SUPER_ADMIN")

                // ── LAB_TECH only ─────────────────────────────────────
                .requestMatchers(
                    "/api/lab-reports/*/upload",
                    "/api/lab-reports/pending"
                ).hasAnyRole("LAB_TECH", "ADMIN",
                             "SUPER_ADMIN")

                // ── PATIENT only ──────────────────────────────────────
                .requestMatchers(
                    "/api/patients/**",
                    "/api/triage/**",
                    "/api/prescriptions/my",
                    "/api/lab-reports/my",
                    "/api/lab-reports/upload-external",
                    "/api/billing/payment/confirm",
                    "/api/billing/payments/my"
                ).hasAnyRole("PATIENT")
                
             //   
                .requestMatchers(
                	    "/api/admin/patients/search"
                	).hasAnyRole("RECEPTIONIST", "ADMIN", "SUPER_ADMIN")
                
             // walk-in registration accessible by receptionist   
                .requestMatchers(
                	    "/api/auth/register-walkin"
                	).hasAnyRole("RECEPTIONIST", "ADMIN", "SUPER_ADMIN")
                
             // ── Patient data — patient reads own, doctor reads assigned ───────────
                .requestMatchers(
                    "/api/patients/profile",
                    "/api/patients/medical-history",
                    "/api/patients/allergies"
                ).hasAnyRole("PATIENT", "DOCTOR", "ADMIN",
                             "SUPER_ADMIN")

                // ── Shared endpoints — multiple roles ─────────────────
                .requestMatchers(
                    "/api/doctors/**",
                    "/api/appointments/book",
                    "/api/appointments/*/cancel",
                    "/api/appointments/my",
                    "/api/notifications/**",
                    "/api/billing/beds/available",
                    "/api/billing/discharge/**"
                ).hasAnyRole("PATIENT", "DOCTOR",
                             "RECEPTIONIST", "ADMIN",
                             "SUPER_ADMIN")

                // ── Everything else requires authentication ────────────
                .anyRequest().authenticated()
            )

            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(
                    authenticationEntryPoint())
                .accessDeniedHandler(
                    accessDeniedHandler())
            )

            .addFilterBefore(jwtFilter,
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ── CORS ──────────────────────────────────────────────────────────────
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allows any origin (including Vercel deployments and localhost) with credentials
        configuration.setAllowedOriginPatterns(List.of("*"));

        configuration.setAllowedMethods(List.of(
            "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));

        configuration.setAllowedHeaders(List.of(
            "Authorization",
            "Content-Type",
            "Accept",
            "X-Requested-With",
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Headers"
        ));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}