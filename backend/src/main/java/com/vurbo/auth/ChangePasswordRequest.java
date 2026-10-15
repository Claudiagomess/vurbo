package com.vurbo.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
		@NotBlank(message = "A palavra-passe atual é obrigatória.") String currentPassword,
		@NotBlank(message = "A nova palavra-passe é obrigatória.")
		@Size(min = 8, max = 80, message = "A palavra-passe tem de ter pelo menos 8 caracteres.")
		String newPassword) {
}
