package com.vurbo.repair;

import com.vurbo.user.UserAccount;
import com.vurbo.user.UserRole;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RepairService {

	private final RepairRepository repairs;
	private final RepairApplicationRepository applications;

	public RepairService(RepairRepository repairs, RepairApplicationRepository applications) {
		this.repairs = repairs;
		this.applications = applications;
	}

	@Transactional(readOnly = true)
	public List<RepairResponse> list(UserAccount user) {
		List<Repair> found = user.getRole() == UserRole.EMPRESA
				? repairs.findAllByOrderByCreatedAtDesc()
				: repairs.findByStatusOrderByCreatedAtDesc(RepairStatus.ABERTA);
		Map<UUID, Long> counts = counts(found.stream().map(Repair::getId).toList());
		Set<UUID> applied = appliedIds(user);
		return found.stream()
				.map(repair -> toResponse(repair, counts.getOrDefault(repair.getId(), 0L), applied.contains(repair.getId())))
				.toList();
	}

	@Transactional(readOnly = true)
	public RepairResponse get(UserAccount user, UUID id) {
		Repair repair = repairs.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reparação não encontrada."));
		boolean applied = applications.existsByRepairIdAndTechnicianId(repair.getId(), user.getId());
		if (user.getRole() == UserRole.TECNICO && repair.getStatus() != RepairStatus.ABERTA && !applied) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Reparação não encontrada.");
		}
		long count = applications.countByRepairIds(List.of(repair.getId())).stream()
				.mapToLong(RepairApplicationRepository.RepairCount::getTotal)
				.findFirst()
				.orElse(0);
		return toResponse(repair, count, applied);
	}

	@Transactional
	public RepairResponse create(UserAccount author, RepairRequests.Create request) {
		Repair repair = new Repair();
		repair.setBrand(request.brand().trim());
		repair.setApplianceType(request.applianceType().trim());
		repair.setModel(blankToNull(request.model()));
		repair.setLocality(request.locality().trim());
		repair.setDescription(request.description().trim());
		repair.setStatus(RepairStatus.ABERTA);
		repair.setCreatedBy(author);
		return toResponse(repairs.save(repair), 0, false);
	}

	@Transactional
	public RepairResponse updateStatus(UUID id, RepairRequests.UpdateStatus request) {
		Repair repair = repairs.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reparação não encontrada."));
		repair.setStatus(request.status());
		long count = applications.countByRepairIds(List.of(repair.getId())).stream()
				.mapToLong(RepairApplicationRepository.RepairCount::getTotal)
				.findFirst()
				.orElse(0);
		return toResponse(repair, count, false);
	}

	@Transactional(readOnly = true)
	public List<ApplicationResponse> listApplications(UUID repairId) {
		if (!repairs.existsById(repairId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Reparação não encontrada.");
		}
		return toApplications(applications.findByRepairIdOrderByCreatedAtAsc(repairId));
	}

	@Transactional
	public ApplicationResponse apply(UserAccount technician, UUID repairId) {
		if (technician.getRole() != UserRole.TECNICO) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Não tem permissão para esta ação.");
		}
		Repair repair = repairs.findById(repairId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reparação não encontrada."));
		if (repair.getStatus() != RepairStatus.ABERTA) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Esta reparação já está fechada.");
		}
		if (applications.existsByRepairIdAndTechnicianId(repairId, technician.getId())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Já se candidatou a esta reparação.");
		}
		RepairApplication application = new RepairApplication();
		application.setRepair(repair);
		application.setTechnician(technician);
		try {
			applications.saveAndFlush(application);
		} catch (DataIntegrityViolationException exception) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Já se candidatou a esta reparação.");
		}
		List<ApplicationResponse> ordered = toApplications(applications.findByRepairIdOrderByCreatedAtAsc(repairId));
		return ordered.stream()
				.filter(item -> item.id().equals(application.getId()))
				.findFirst()
				.orElseThrow();
	}

	@Transactional(readOnly = true)
	public List<MyApplicationResponse> mine(UserAccount technician) {
		return applications.findByTechnicianIdOrderByCreatedAtDesc(technician.getId()).stream()
				.map(application -> {
					List<RepairApplication> ordered = applications.findByRepairIdOrderByCreatedAtAsc(application.getRepair().getId());
					int position = positionOf(ordered, application.getId());
					long count = ordered.size();
					RepairResponse repair = toResponse(application.getRepair(), count, true);
					return new MyApplicationResponse(application.getId(), application.getCreatedAt(), position, repair);
				})
				.toList();
	}

	private Set<UUID> appliedIds(UserAccount user) {
		if (user.getRole() != UserRole.TECNICO) {
			return Set.of();
		}
		return new HashSet<>(applications.findRepairIdsByTechnicianId(user.getId()));
	}

	private Map<UUID, Long> counts(List<UUID> ids) {
		if (ids.isEmpty()) {
			return Map.of();
		}
		Map<UUID, Long> counts = new HashMap<>();
		for (RepairApplicationRepository.RepairCount row : applications.countByRepairIds(ids)) {
			counts.put(row.getRepairId(), row.getTotal());
		}
		return counts;
	}

	private List<ApplicationResponse> toApplications(List<RepairApplication> ordered) {
		List<ApplicationResponse> responses = new java.util.ArrayList<>();
		int position = 1;
		for (RepairApplication application : ordered) {
			responses.add(new ApplicationResponse(
					application.getId(),
					application.getTechnician().getId(),
					application.getTechnician().getName(),
					application.getTechnician().getUsername(),
					application.getCreatedAt(),
					position));
			position++;
		}
		return responses;
	}

	private int positionOf(List<RepairApplication> ordered, UUID applicationId) {
		int position = 1;
		for (RepairApplication application : ordered) {
			if (application.getId().equals(applicationId)) {
				return position;
			}
			position++;
		}
		return position;
	}

	private RepairResponse toResponse(Repair repair, long applicationCount, boolean applied) {
		return new RepairResponse(
				repair.getId(),
				repair.getBrand(),
				repair.getApplianceType(),
				repair.getModel(),
				repair.getLocality(),
				repair.getDescription(),
				repair.getStatus(),
				repair.getCreatedAt(),
				applicationCount,
				applied);
	}

	private String blankToNull(String value) {
		if (value == null || value.isBlank()) {
			return null;
		}
		return value.trim();
	}
}
