package com.shms.dto;

import com.shms.model.Patient;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PatientProfileRequest {

    @Pattern(regexp = "^[a-zA-Z\\s]{2,100}$", message = "Name must contain only alphabets and spaces (2-100 characters)")
    private String name;

    private String countryCode = "+91";

    @Pattern(regexp = "^[1-9][0-9]{9}$", message = "Phone number must be exactly 10 numeric digits and cannot start with 0")
    private String phone;

    @Past(message = "Date of birth must be a past date")
    private LocalDate dateOfBirth;

    private Patient.Gender gender;

    private String bloodGroup;

    @Size(min = 5, message = "Address must be at least 5 characters long")
    private String address;

    private String city;
    private String state;
    private String country;

    @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Pincode must be exactly 6 numeric digits and cannot start with 0")
    private String pincode;

    @Pattern(regexp = "^[a-zA-Z\\s]{2,100}$", message = "Emergency contact name must contain only alphabets and spaces")
    private String emergencyContactName;

    @Pattern(regexp = "^[1-9][0-9]{9}$", message = "Emergency contact phone must be 10 numeric digits and cannot start with 0")
    private String emergencyContactPhone;
}