package com.shms.dto;

import lombok.Data;

@Data
public class UserStatusUpdateDTO {

    private Boolean isActive;
    private String reason;
}