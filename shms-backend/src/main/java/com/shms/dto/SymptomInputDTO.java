package com.shms.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class SymptomInputDTO {

    private String bodyArea;
    private List<String> symptoms;
    private Integer durationDays;
    private String language;
    private Map<String, String> followUpAnswers;
}