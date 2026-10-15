package com.vurbo.repair;

import com.vurbo.user.CurrentUser;
import com.vurbo.user.UserAccount;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/repairs")
public class RepairController {

	private final RepairService repairs;
	private final CurrentUser currentUser;

	public RepairController(RepairService repairs, CurrentUser currentUser) {
		this.repairs = repairs;
		this.currentUser = currentUser;
	}

	@GetMapping
	List<RepairResponse> list() {
		return repairs.list(currentUser.require());
	}

	@PostMapping
	RepairResponse create(@Valid @RequestBody RepairRequests.Create request) {
		return repairs.create(currentUser.require(), request);
	}

	@GetMapping("/{id}")
	RepairResponse get(@PathVariable UUID id) {
		return repairs.get(currentUser.require(), id);
	}

	@PatchMapping("/{id}")
	RepairResponse updateStatus(@PathVariable UUID id, @Valid @RequestBody RepairRequests.UpdateStatus request) {
		currentUser.require();
		return repairs.updateStatus(id, request);
	}

	@GetMapping("/{id}/applications")
	List<ApplicationResponse> applications(@PathVariable UUID id) {
		currentUser.require();
		return repairs.listApplications(id);
	}

	@PostMapping("/{id}/applications")
	ApplicationResponse apply(@PathVariable UUID id) {
		return repairs.apply(currentUser.require(), id);
	}

	@GetMapping("/applications/mine")
	List<MyApplicationResponse> mine() {
		UserAccount user = currentUser.require();
		return repairs.mine(user);
	}
}
