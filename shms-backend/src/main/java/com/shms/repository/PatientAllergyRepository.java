package com.shms.repository;

import com.shms.model.PatientAllergy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientAllergyRepository
        extends JpaRepository<PatientAllergy, Long> {

    List<PatientAllergy> findByPatientPatientId(Long patientId);

    // Used during prescription - check drug allergies only
    List<PatientAllergy> findByPatientPatientIdAndIsDrugAllergyTrue(Long patientId);
}