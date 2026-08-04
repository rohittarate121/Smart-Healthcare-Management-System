package com.shms.repository;

import com.shms.model.Doctor;
import com.shms.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository
        extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByUser(User user);

    Optional<Doctor> findByUserUserId(Long userId);

    List<Doctor> findBySpecializationContainingIgnoreCase(
            String specialization);

    List<Doctor> findByIsAvailableTrue();

    List<Doctor> findByDepartmentDeptId(Long deptId);
}