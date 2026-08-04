package com.shms.repository;

import com.shms.model.Patient;
import com.shms.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByUser(User user);

    Optional<Patient> findByUserUserId(Long userId);

    Boolean existsByUserUserId(Long userId);
}