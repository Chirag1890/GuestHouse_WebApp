package com.Application.GuestHouseBooking.repository;

import com.Application.GuestHouseBooking.entity.AuditLogs;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLogs, Long> {
    List<AuditLogs> findByEntityNameAndEntityId(String entityName, Long entityId);
    List<AuditLogs> findByChangedBy(String changedBy);
}