package com.shms.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CompleteAppointmentDTO {

    private String consultationNotes;
    private String diagnosis;
    private LocalDateTime followUpDate;
}