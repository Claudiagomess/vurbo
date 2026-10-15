package com.vurbo.user;

import java.time.Instant;
import java.util.UUID;

public record TechnicianResponse(UUID id, String username, String name, boolean active, Instant createdAt) {

	public static TechnicianResponse from(UserAccount user) {
		return new TechnicianResponse(user.getId(), user.getUsername(), user.getName(), user.isActive(), user.getCreatedAt());
	}
}
