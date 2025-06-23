package com.Application.GuestHouseBooking.service.implementations;
import com.Application.GuestHouseBooking.entity.AuditLogs;
import com.Application.GuestHouseBooking.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditLogServices {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void logAudit(String entityName, Long entityId, String operationType, String changedBy, String oldValue, String newValue, String remarks) {
        AuditLogs auditLog = new AuditLogs();
        auditLog.setEntityName(entityName);
        auditLog.setEntityId(entityId);
        auditLog.setOperationType(operationType);
        auditLog.setChangedBy(changedBy);
        auditLog.setOldValue(oldValue);
        auditLog.setNewValue(newValue);
        auditLog.setRemarks(remarks);
        // timestamp is @CreationTimestamped
        auditLogRepository.save(auditLog);
    }

    public List<AuditLogs> getAuditLogsForEntity(String entityName, Long entityId) {
        return auditLogRepository.findByEntityNameAndEntityId(entityName, entityId);
    }

    public List<AuditLogs> getAuditLogsByChangedBy(String changedBy) {
        return auditLogRepository.findByChangedBy(changedBy);
    }

    public List<AuditLogs> getAllAuditLogs() {
        return auditLogRepository.findAll();
    }
}