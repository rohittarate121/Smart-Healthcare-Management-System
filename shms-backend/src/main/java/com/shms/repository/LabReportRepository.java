package com.shms.repository;

import com.shms.model.LabReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabReportRepository
        extends JpaRepository<LabReport, Long> {

    List<LabReport> findByPatientPatientId(
            Long patientId);

    List<LabReport> findByAppointmentApptId(
            Long apptId);

    List<LabReport> findByOrderedByDoctorId(
            Long doctorId);

    List<LabReport> findByPatientPatientIdOrderByUploadDateDesc(
            Long patientId);
}