package com.shms.repository;

import com.shms.model.InsuranceClaim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InsuranceClaimRepository
        extends JpaRepository<InsuranceClaim, Long> {

    List<InsuranceClaim> findByPatientPatientId(
            Long patientId);

    Optional<InsuranceClaim> findByAdmissionAdmissionId(
            Long admissionId);

    List<InsuranceClaim> findByStatus(
            InsuranceClaim.ClaimStatus status);
}