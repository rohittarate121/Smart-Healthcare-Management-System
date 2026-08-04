package com.shms.dto;

import com.shms.model.LabReport;
import lombok.Data;

@Data
public class LabReportRequestDTO {

    private Long patientId;
    private Long apptId;
    private String testName;
    private String notes;
    private LabReport.ReportSource source;
}