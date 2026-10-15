package com.vurbo.user;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class CurrentUser {

	private final UserAccountRepository users;

	public CurrentUser(UserAccountRepository users) {
		this.users = users;
	}

	public UserAccount require() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "É necessário iniciar sessão.");
		}
		return users.findByUsername(authentication.getName())
				.filter(UserAccount::isActive)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "É necessário iniciar sessão."));
	}
}
