package com.shms.repository;

import com.shms.model.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, Long> {
    List<PaymentRecord> findByInvoiceInvoiceIdOrderByPaymentDateDesc(Long invoiceId);
    List<PaymentRecord> findByPatientPatientIdOrderByPaymentDateDesc(Long patientId);
}
