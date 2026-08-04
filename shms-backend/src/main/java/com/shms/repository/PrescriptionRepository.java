package com.shms.repository;

import com.shms.model.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PrescriptionRepository
        extends JpaRepository<Prescription, Long> {

    List<Prescription> findByPatientPatientId(
            Long patientId);

    List<Prescription> findByDoctorDoctorId(
            Long doctorId);

    Optional<Prescription> findByAppointmentApptId(
            Long apptId);
}