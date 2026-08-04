package com.shms.dto;

import lombok.Data;

@Data
public class AdmissionRequestDTO {

    private Long patientId;
    private Long doctorId;
    private Long bedId;
    private String admissionReason;
}