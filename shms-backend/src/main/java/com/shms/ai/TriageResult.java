package com.shms.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TriageResult {

    private int severityScore;
    private String urgencyLevel;
    private String recommendedSpecialty;
    private String probableCondition;
    private boolean isEmergency;
    private String triageSummary;
}