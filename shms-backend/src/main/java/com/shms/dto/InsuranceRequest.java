package com.shms.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class InsuranceRequest {

    private String providerName;
    private String policyNumber;
    private String groupNumber;
    private BigDecimal sumInsured;
    private LocalDate validFrom;
    private LocalDate validUntil;
    private String coverageType;
}