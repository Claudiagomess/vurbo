package com.vurbo.repair;

import java.time.Instant;
import java.util.UUID;

public record RepairResponse(
		UUID id,
		String brand,
		String applianceType,
		String model,
		String locality,
		String description,
		RepairStatus status,
		Instant createdAt,
		long applicationCount,
		boolean applied) {
}
