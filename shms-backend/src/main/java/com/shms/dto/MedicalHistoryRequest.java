package com.shms.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class MedicalHistoryRequest {

    private String conditionName;
    private LocalDate diagnosedDate;
    private Boolean isChronic;
    private String notes;
}