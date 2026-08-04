package com.shms.repository;

import com.shms.model.PrescriptionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionItemRepository
        extends JpaRepository<PrescriptionItem, Long> {

    List<PrescriptionItem> findByPrescriptionPrescriptionId(
            Long prescriptionId);
}