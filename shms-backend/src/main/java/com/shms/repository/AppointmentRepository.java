package com.shms.repository;

import com.shms.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository
        extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatientPatientId(Long patientId);

    List<Appointment> findByDoctorDoctorId(Long doctorId);

    List<Appointment> findByPatientPatientIdOrderByCreatedAtDesc(
            Long patientId);

    List<Appointment> findByDoctorDoctorIdAndStatus(
            Long doctorId, Appointment.AppointmentStatus status);
}