package com.vurbo.repair;

import java.time.Instant;
import java.util.UUID;

public record ApplicationResponse(
		UUID id,
		UUID technicianId,
		String technicianName,
		String technicianUsername,
		Instant createdAt,
		int position) {
}
