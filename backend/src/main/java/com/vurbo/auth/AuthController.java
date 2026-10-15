package com.vurbo.auth;

import com.vurbo.user.CurrentUser;
import com.vurbo.user.UserAccount;
import com.vurbo.user.UserAccountRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final UserAccountRepository users;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;
	private final CurrentUser currentUser;

	public AuthController(
			UserAccountRepository users,
			PasswordEncoder passwordEncoder,
			JwtService jwtService,
			CurrentUser currentUser) {
		this.users = users;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
		this.currentUser = currentUser;
	}

	@PostMapping("/login")
	AuthResponse login(@Valid @RequestBody LoginRequest request) {
		String username = request.username().trim().toLowerCase();
		UserAccount user = users.findByUsername(username).orElse(null);
		if (user == null || !user.isActive() || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilizador ou palavra-passe incorretos.");
		}
		return new AuthResponse(jwtService.issue(user), user.getId(), user.getUsername(), user.getName(), user.getRole());
	}

	@GetMapping("/me")
	AuthResponse me() {
		UserAccount user = currentUser.require();
		return new AuthResponse(null, user.getId(), user.getUsername(), user.getName(), user.getRole());
	}

	@PatchMapping("/password")
	void changePassword(@Valid @RequestBody ChangePasswordRequest request) {
		UserAccount user = currentUser.require();
		if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A palavra-passe atual não está correta.");
		}
		user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
		users.save(user);
	}
}
