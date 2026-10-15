package com.vurbo.repair;

import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RepairApplicationRepository extends JpaRepository<RepairApplication, UUID> {

	List<RepairApplication> findByRepairIdOrderByCreatedAtAsc(UUID repairId);

	List<RepairApplication> findByTechnicianIdOrderByCreatedAtDesc(UUID technicianId);

	boolean existsByRepairIdAndTechnicianId(UUID repairId, UUID technicianId);

	@Query("select a.repair.id from RepairApplication a where a.technician.id = :technicianId")
	List<UUID> findRepairIdsByTechnicianId(@Param("technicianId") UUID technicianId);

	@Query("""
			select a.repair.id as repairId, count(a) as total
			from RepairApplication a
			where a.repair.id in :ids
			group by a.repair.id
			""")
	List<RepairCount> countByRepairIds(@Param("ids") Collection<UUID> ids);

	interface RepairCount {
		UUID getRepairId();
		long getTotal();
	}
}
