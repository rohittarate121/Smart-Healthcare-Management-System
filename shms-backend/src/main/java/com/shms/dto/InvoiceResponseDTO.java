package com.shms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponseDTO {

    private Long invoiceId;
    private String invoiceNumber;
    private Long admissionId;
    private Long patientId;
    private String patientName;
    private String registrationNumber;
    private String phone;
    private String email;
    private String doctorName;
    private String departmentName;
    private String bedNumber;
    private String wardName;
    private LocalDateTime admissionDate;
    private LocalDateTime dischargeDate;
    private LocalDateTime invoiceDate;

    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal discountPercentage;
    private BigDecimal gstPercentage;
    private BigDecimal gstAmount;
    private BigDecimal grandTotal;
    private BigDecimal paidAmount;
    private BigDecimal dueAmount;
    private String paymentStatus;
    private String paymentMethod;
    private String pdfPath;

    private List<InvoiceItemDTO> items;
    private List<PaymentRecordDTO> paymentRecords;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InvoiceItemDTO {
        private Long itemId;
        private String description;
        private String category;
        private BigDecimal unitPrice;
        private Integer quantity;
        private BigDecimal totalPrice;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentRecordDTO {
        private Long recordId;
        private BigDecimal amount;
        private String paymentMethod;
        private String transactionRef;
        private LocalDateTime paymentDate;
        private String notes;
    }
}
