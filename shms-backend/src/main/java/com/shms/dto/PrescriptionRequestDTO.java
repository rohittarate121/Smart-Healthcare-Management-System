package com.shms.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class PrescriptionRequestDTO {

    private Long apptId;
    private String diagnosis;
    private String advice;
    private LocalDate followUpDate;
    private List<MedicineItemDTO> medicines;

    @Data
    public static class MedicineItemDTO {
        private String medicineName;
        private String dosage;
        private String frequency;
        private Integer durationDays;
        private String instructions;
    }
}