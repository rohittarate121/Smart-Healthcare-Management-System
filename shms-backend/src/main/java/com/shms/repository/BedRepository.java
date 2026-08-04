package com.shms.repository;

import com.shms.model.Bed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BedRepository
        extends JpaRepository<Bed, Long> {

    List<Bed> findByIsOccupiedFalse();

    List<Bed> findByWardWardId(Long wardId);

    List<Bed> findByBedTypeAndIsOccupiedFalse(
            Bed.BedType bedType);
}