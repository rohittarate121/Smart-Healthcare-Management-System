package com.shms.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class SlotRequestDTO {

    private LocalDate slotDate;
    private LocalTime startTime;
    private LocalTime endTime;
}