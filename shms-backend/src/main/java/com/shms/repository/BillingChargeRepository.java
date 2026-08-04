package com.shms.repository;

import com.shms.model.BillingCharge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillingChargeRepository extends JpaRepository<BillingCharge, Long> {
    List<BillingCharge> findByAccountAccountId(Long accountId);
    List<BillingCharge> findByAccountAccountIdOrderByChargeDateDesc(Long accountId);
}
