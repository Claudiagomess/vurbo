package com.vurbo.user;

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
@RequestMapping("/api/technicians")
public class TechnicianController {

	private final TechnicianService technicians;

	public TechnicianController(TechnicianService technicians) {
		this.technicians = technicians;
	}

	@GetMapping
	List<TechnicianResponse> list() {
		return technicians.list();
	}

	@PostMapping
	TechnicianResponse create(@Valid @RequestBody TechnicianRequests.Create request) {
		return technicians.create(request);
	}

	@PatchMapping("/{id}")
	TechnicianResponse update(@PathVariable UUID id, @Valid @RequestBody TechnicianRequests.Update request) {
		return technicians.update(id, request);
	}
}
