package com.shms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillingResponseDTO {

    private Long admissionId;
    private String patientName;
    private BigDecimal totalBill;
    private BigDecimal bedCharges;
    private BigDecimal labCharges;
    private BigDecimal consultationCharges;
    private boolean hasInsurance;
    private String insuranceProvider;
    private BigDecimal claimedAmount;
    private BigDecimal patientCopay;
    private String claimStatus;
    private String message;
}