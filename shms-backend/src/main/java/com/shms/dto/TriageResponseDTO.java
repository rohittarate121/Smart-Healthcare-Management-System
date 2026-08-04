package com.shms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TriageResponseDTO {

    private Long sessionId;
    private Long reportId;
    private int severityScore;
    private String urgencyLevel;
    private String recommendedSpecialty;
    private String probableCondition;
    private String triageSummary;
    private boolean isEmergency;
    private String message;
}