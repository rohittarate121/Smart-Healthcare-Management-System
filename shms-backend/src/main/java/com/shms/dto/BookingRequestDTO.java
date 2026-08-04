package com.shms.dto;

import com.shms.model.Appointment;
import lombok.Data;

@Data
public class BookingRequestDTO {

    private Long doctorId;
    private Long availId;
    private Long triageReportId;
    private Appointment.AppointmentType apptType;
    private String notes;
}