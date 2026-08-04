package com.shms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiveBillDTO {

    private Long accountId;
    private Long admissionId;
    private Long patientId;
    private String patientName;
    private String registrationNumber;
    private String doctorName;
    private String bedNumber;
    private String wardName;
    private LocalDateTime admittedAt;
    private long daysAdmitted;

    private BigDecimal dailyRoomCharge;
    private BigDecimal roomChargesTotal;
    private BigDecimal accruedChargesTotal;
    private BigDecimal runningTotal;

    private Map<String, BigDecimal> categoryBreakdown;
    private List<ChargeItemDTO> charges;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChargeItemDTO {
        private Long chargeId;
        private String chargeName;
        private String category;
        private BigDecimal amount;
        private Integer quantity;
        private BigDecimal totalAmount;
        private LocalDateTime chargeDate;
        private String notes;
    }
}
