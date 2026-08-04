package com.shms.repository;

import com.shms.model.Admission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdmissionRepository
        extends JpaRepository<Admission, Long> {

    List<Admission> findByPatientPatientId(
            Long patientId);

    Optional<Admission> findByPatientPatientIdAndStatus(
            Long patientId,
            Admission.AdmissionStatus status);

    List<Admission> findByStatus(
            Admission.AdmissionStatus status);
}