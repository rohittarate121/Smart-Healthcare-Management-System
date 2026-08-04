package com.shms.repository;

import com.shms.model.BillingAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BillingAccountRepository extends JpaRepository<BillingAccount, Long> {
    Optional<BillingAccount> findByAdmissionAdmissionId(Long admissionId);
    Optional<BillingAccount> findByAdmissionAdmissionIdAndStatus(Long admissionId, BillingAccount.AccountStatus status);
}
