package com.vurbo.repair;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class RepairRequests {

	private RepairRequests() {
	}

	public record Create(
			@NotBlank(message = "A marca é obrigatória.") @Size(max = 120) String brand,
			@NotBlank(message = "O tipo de aparelho é obrigatório.") @Size(max = 120) String applianceType,
			@Size(max = 120) String model,
			@NotBlank(message = "A localidade é obrigatória.") @Size(max = 120) String locality,
			@NotBlank(message = "A descrição é obrigatória.") @Size(max = 2000) String description) {
	}

	public record UpdateStatus(@NotNull(message = "O estado é obrigatório.") RepairStatus status) {
	}
}
