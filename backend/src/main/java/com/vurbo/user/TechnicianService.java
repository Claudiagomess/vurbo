package com.vurbo.user;

import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TechnicianService {

	private final UserAccountRepository users;
	private final PasswordEncoder passwordEncoder;

	public TechnicianService(UserAccountRepository users, PasswordEncoder passwordEncoder) {
		this.users = users;
		this.passwordEncoder = passwordEncoder;
	}

	@Transactional(readOnly = true)
	public List<TechnicianResponse> list() {
		return users.findByRoleOrderByNameAsc(UserRole.TECNICO).stream().map(TechnicianResponse::from).toList();
	}

	@Transactional
	public TechnicianResponse create(TechnicianRequests.Create request) {
		String username = request.username().trim().toLowerCase();
		if (users.existsByUsername(username)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Esse utilizador já existe.");
		}
		UserAccount technician = new UserAccount();
		technician.setUsername(username);
		technician.setName(request.name().trim());
		technician.setPasswordHash(passwordEncoder.encode(request.password()));
		technician.setRole(UserRole.TECNICO);
		technician.setActive(true);
		return TechnicianResponse.from(users.save(technician));
	}

	@Transactional
	public TechnicianResponse update(UUID id, TechnicianRequests.Update request) {
		UserAccount technician = users.findById(id)
				.filter(user -> user.getRole() == UserRole.TECNICO)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Técnico não encontrado."));
		if (request.name() != null && !request.name().isBlank()) {
			technician.setName(request.name().trim());
		}
		if (request.active() != null) {
			technician.setActive(request.active());
		}
		if (request.password() != null && !request.password().isBlank()) {
			technician.setPasswordHash(passwordEncoder.encode(request.password()));
		}
		return TechnicianResponse.from(technician);
	}
}
