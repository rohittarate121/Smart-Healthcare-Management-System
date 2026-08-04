package com.shms.repository;

import com.shms.model.PatientInsurance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientInsuranceRepository
        extends JpaRepository<PatientInsurance, Long> {

    List<PatientInsurance> findByPatientPatientId(Long patientId);

    Optional<PatientInsurance> findByPatientPatientIdAndIsActiveTrue(Long patientId);
}