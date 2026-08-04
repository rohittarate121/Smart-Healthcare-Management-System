package com.shms.dto;

import com.shms.model.Patient;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PatientProfileRequest {

    private LocalDate dateOfBirth;
    private Patient.Gender gender;
    private String bloodGroup;
    private String address;
    private String city;
    private String pincode;
    private String emergencyContactName;
    private String emergencyContactPhone;
}