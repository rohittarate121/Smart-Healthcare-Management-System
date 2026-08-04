package com.shms.repository;

import com.shms.model.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorAvailabilityRepository
        extends JpaRepository<DoctorAvailability, Long> {

    List<DoctorAvailability> findByDoctorDoctorIdAndSlotDate(
            Long doctorId, LocalDate slotDate);

    List<DoctorAvailability> findByDoctorDoctorIdAndIsBookedFalse(
            Long doctorId);

    List<DoctorAvailability>
        findByDoctorDoctorIdAndSlotDateAndIsBookedFalse(
            Long doctorId, LocalDate slotDate);
    
    List<DoctorAvailability> findByDoctorDoctorId(
            Long doctorId);

    Optional<DoctorAvailability>
        findByAvailIdAndIsBookedFalse(Long availId);
}