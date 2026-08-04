package com.shms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {

    // Counts
    private long totalPatients;
    private long totalDoctors;
    private long totalAppointments;
    private long totalAdmissions;

    // Today
    private long appointmentsToday;
    private long admissionsActive;
    private long bedsAvailable;
    private long bedsOccupied;

    // Financial
    private double totalRevenue;
    private long pendingInsuranceClaims;
    private long pendingLabReports;
}