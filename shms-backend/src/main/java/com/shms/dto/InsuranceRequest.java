package com.shms.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class InsuranceRequest {

    @NotBlank(message = "Insurance provider is required")
    private String providerName;

    @NotBlank(message = "Policy number is required")
    @Pattern(regexp = "^[a-zA-Z0-9]{8,13}$", message = "Policy number must be 8-13 alphanumeric characters")
    private String policyNumber;

    private String groupNumber;

    @NotNull(message = "Sum insured is required")
    @Positive(message = "Sum insured must be greater than zero")
    private BigDecimal sumInsured;

    private LocalDate validFrom;

    @NotNull(message = "Expiry date is required")
    @FutureOrPresent(message = "Expiry date cannot be expired")
    private LocalDate validUntil;

    @NotBlank(message = "Coverage type is required")
    private String coverageType;

    @NotBlank(message = "Insurance type is required")
    private String insuranceType;
}