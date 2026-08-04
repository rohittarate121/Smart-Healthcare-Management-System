package com.shms.dto;

import com.shms.model.PatientAllergy;
import lombok.Data;

@Data
public class AllergyRequest {

    private String allergen;
    private String reaction;
    private PatientAllergy.Severity severity;
    private Boolean isDrugAllergy;
}