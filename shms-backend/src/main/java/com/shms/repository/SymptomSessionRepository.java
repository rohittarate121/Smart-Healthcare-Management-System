package com.shms.repository;

import com.shms.model.SymptomSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SymptomSessionRepository
        extends JpaRepository<SymptomSession, Long> {

    List<SymptomSession> findByPatientPatientIdOrderByCreatedAtDesc(
            Long patientId);
}