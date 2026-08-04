package com.shms.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI shmsOpenAPI() {

        final String securitySchemeName = "Bearer Authentication";

        return new OpenAPI()

                .info(new Info()

                        .title("🏥 Smart Healthcare Management System (SHMS) API")

                        .description("""
Enterprise REST API Documentation for the Smart Healthcare Management System.

Features:
• JWT Authentication
• OTP Authentication
• Role-Based Access Control (RBAC)
• AI Symptom Triage
• Appointment Management
• Electronic Health Records (EHR)
• Prescription Management
• Laboratory Reports
• Billing & Insurance
• Inpatient Admission
• Notifications

User Roles:
• Super Admin
• Admin
• Doctor
• Receptionist
• Lab Technician
• Patient
""")

                        .version("1.0.0")

                        .contact(new Contact()
                                .name("Rohit Tarate")
                                .email("your-email@example.com"))

                        .license(new License()
                                .name("CDAC DAC Final Project")))

                .addSecurityItem(
                        new SecurityRequirement()
                                .addList(securitySchemeName))

                .schemaRequirement(
                        securitySchemeName,

                        new SecurityScheme()

                                .name("Authorization")

                                .type(SecurityScheme.Type.HTTP)

                                .scheme("bearer")

                                .bearerFormat("JWT"));
    }
}