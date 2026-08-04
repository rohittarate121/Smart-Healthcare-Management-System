package com.shms.repository;

import com.shms.model.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationLogRepository
        extends JpaRepository<NotificationLog, Long> {

    List<NotificationLog> findByUserUserIdOrderBySentAtDesc(
            Long userId);

    List<NotificationLog> findByUserUserIdAndReadAtIsNull(
            Long userId);

    List<NotificationLog> findByChannel(
            NotificationLog.Channel channel);
}