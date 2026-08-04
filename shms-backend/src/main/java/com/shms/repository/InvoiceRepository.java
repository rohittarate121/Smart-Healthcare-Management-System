package com.shms.repository;

import com.shms.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    Optional<Invoice> findByAdmissionAdmissionId(Long admissionId);
    List<Invoice> findByPatientPatientIdOrderByGeneratedAtDesc(Long patientId);

    @Query("SELECT i FROM Invoice i WHERE " +
           "(:query IS NULL OR LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(i.patient.user.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(i.patient.registrationNumber) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY i.generatedAt DESC")
    List<Invoice> searchInvoices(@Param("query") String query);
}
