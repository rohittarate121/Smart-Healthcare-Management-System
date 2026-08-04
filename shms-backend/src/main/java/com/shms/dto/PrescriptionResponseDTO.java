package com.shms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionResponseDTO {

    private Long prescriptionId;
    private Long apptId;
    private String patientName;
    private String doctorName;
    private String diagnosis;
    private String advice;
    private LocalDate followUpDate;
    private LocalDateTime issuedAt;
    private List<MedicineItemResponse> medicines;

    // Allergy warnings found during check
    private List<String> allergyWarnings;
    private boolean hasAllergyConflict;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedicineItemResponse {
        private Long itemId;
        private String medicineName;
        private String dosage;
        private String frequency;
        private Integer durationDays;
        private String instructions;
        private Boolean isAllergyFlagged;
    }
}