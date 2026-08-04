package com.shms.repository;

import com.shms.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository
        extends JpaRepository<Payment, Long> {

    List<Payment> findByPatientPatientId(Long patientId);

    Optional<Payment> findByAdmissionAdmissionId(
            Long admissionId);

    Optional<Payment> findByAppointmentApptId(
            Long apptId);
}