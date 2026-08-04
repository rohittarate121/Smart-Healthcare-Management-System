package com.shms.dto;

import com.shms.model.BillingCharge;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddChargeDTO {

    @NotNull(message = "Admission ID is required")
    private Long admissionId;

    @NotBlank(message = "Charge name is required")
    private String chargeName;

    @NotNull(message = "Charge category is required")
    private BillingCharge.ChargeCategory category;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;

    @Min(value = 1, message = "Quantity must be at least 1")
    @Builder.Default
    private Integer quantity = 1;

    private String notes;
}
