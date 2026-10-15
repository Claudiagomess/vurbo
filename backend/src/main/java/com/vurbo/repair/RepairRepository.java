package com.vurbo.repair;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RepairRepository extends JpaRepository<Repair, UUID> {

	List<Repair> findAllByOrderByCreatedAtDesc();

	List<Repair> findByStatusOrderByCreatedAtDesc(RepairStatus status);
}
