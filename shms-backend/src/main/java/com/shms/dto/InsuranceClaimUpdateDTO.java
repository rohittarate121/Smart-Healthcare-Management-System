package com.shms.dto;

import com.shms.model.InsuranceClaim;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class InsuranceClaimUpdateDTO {

    private InsuranceClaim.ClaimStatus status;
    private BigDecimal approvedAmount;
    private String rejectionReason;
}