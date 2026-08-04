package com.shms.exception;

public class DoctorProfileNotFoundException extends RuntimeException {

    public DoctorProfileNotFoundException() {
        super("Doctor profile not found. Please complete your doctor profile.");
    }

    public DoctorProfileNotFoundException(String message) {
        super(message);
    }
}
