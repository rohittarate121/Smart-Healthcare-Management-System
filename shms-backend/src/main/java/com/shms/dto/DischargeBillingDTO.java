package com.shms.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DischargeBillingDTO {

    private String dischargeSummary;

    @DecimalMin(value = "0.00", message = "Discount cannot be negative")
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @DecimalMin(value = "0.00", message = "Discount percentage cannot be negative")
    @DecimalMax(value = "100.00", message = "Discount percentage cannot exceed 100")
    @Builder.Default
    private BigDecimal discountPercentage = BigDecimal.ZERO;

    @DecimalMin(value = "0.00", message = "GST percentage cannot be negative")
    @DecimalMax(value = "100.00", message = "GST percentage cannot exceed 100")
    @Builder.Default
    private BigDecimal gstPercentage = BigDecimal.ZERO;

    private String paymentMethod; // Cash, UPI, Card, Net Banking, Insurance
    private BigDecimal initialPaymentAmount; // optional deposit/upfront payment
}
