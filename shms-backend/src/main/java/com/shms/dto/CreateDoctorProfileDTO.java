package com.shms.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreateDoctorProfileDTO {

    private String specialization;
    private String qualification;
    private Integer experienceYears;
    private String registrationNo;
    private BigDecimal consultationFee;
    private String bio;
}