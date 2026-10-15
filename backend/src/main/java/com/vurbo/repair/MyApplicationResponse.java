package com.vurbo.repair;

import java.time.Instant;
import java.util.UUID;

public record MyApplicationResponse(UUID id, Instant createdAt, int position, RepairResponse repair) {
}
