package com.shms.dto;

import com.shms.model.Payment;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentRequestDTO {

    private BigDecimal amount;
    private Payment.PaymentMethod paymentMethod;
    private Payment.PaymentType paymentType;
    // For OPD — provide apptId
    private Long apptId;
    // For Inpatient — provide admissionId
    private Long admissionId;
}